import React, { useState, useEffect } from 'react'
import { Section, Flex, Button, Input, Text } from '../styles/main/MainStyles';
import TruckTile from './reinforcement/TruckTile';
import EmptyTile from './reinforcement/EmptyTile';
import PickupTile from './reinforcement/PickupTile';
import DropoffTile from './reinforcement/DropoffTile';
import { EditButton, PlayButton, ForwardButton, BackwardButton } from './reinforcement/Buttons';
import { Slider, CircularProgress } from '@material-ui/core';
import * as api from '../api/api';

export default function ReinforcementLearning() {
  // Board configuration state
  const [width, setWidth] = useState(4);
  const [height, setHeight] = useState(4);
  const [cargoPickups, setCargoPickups] = useState([]);
  const [cargoDropoffs, setCargoDropoffs] = useState([]);

  // Edit state
  const [edit, setEdit] = useState(false);
  const [mode, setMode] = useState("Pickup");
  const [newPickup, setNewPickup] = useState(null);
  const [changed, setChanged] = useState(false);

  // Run game state
  const [truckLocation, setTruckLocation] = useState(null);

  // Model and game states
  const [matrix, setMatrix] = useState([]);
  const [game, setGame] = useState([]);
  const [loading, setLoading] = useState(false);
  const [gameMode, setGameMode] = useState(false);
  const [frame, setFrame] = useState(0);

  // Pickup and dropoff tile colors
  const COLORS = {
    "B": "#306BFF",
    "R": "#E13131",
    "Y": "#DA9716",
    "P": "#E249CA",
    "-": "#444444"
  }

  // Reset edit mode state on new edit instance
  useEffect(() => {
    setMode("Pickup")
  }, [edit])

  function sleep (time) {
    return new Promise((resolve) => setTimeout(resolve, time));
  }

  function getParams() {
    return {
      width: parseInt(width),
      height: parseInt(height),
      cargoPickups: cargoPickups,
      cargoDropoffs: cargoDropoffs
    }
  }

  function trainModel() {
    api
      .train(getParams())
      .then(res => {
        getModel()
      })
      .catch(err => console.log(err))
  }

  // Send current board to API to train model
  function getModel() {
    if (!gameMode && cargoPickups.length > 0) {
      setLoading(true)
      api
        .get(getParams())
        .then(async(res) => {
          if (res.status === 204) {
            await sleep(5000)
            getModel()
          } else {
            setMatrix(res)
            setLoading(false)
            setChanged(false)
          }
        })
    }
  }

  // Send Q matrix and board to API to run an game instance
  function runModel() {
    if (!gameMode && matrix.length > 0 && !changed) {
      api
        .run({
          matrix: matrix,
          truckLocation: truckLocation,
          ...getParams()
        })
        .then(res => {
          setGame(res)
        })
    }
  }

  // Return color of next cargo pickup/dropoff the user can add
  function getColor() {
    return COLORS[Object.keys(COLORS)[cargoPickups.length]];
  }

  // Returns true if more cargo locations can be added to the board
  function canAddMore() {
    return cargoPickups.length < Object.keys(COLORS).length - 1;
  }

  // Returns whether a command is a movement command
  function isMovement(command) {
    return ["Up", "Down", "Left", "Right"].includes(command)
  }

  // Change edit mode and add cargo pickups and dropoffs by pair
  function changeMode(index) {
    if (mode === "Dropoff") {
      setCargoPickups([...cargoPickups, newPickup])
      setCargoDropoffs([...cargoDropoffs, index])
      setChanged(true)
      setMode("Pickup")
    } else if (mode === "Pickup") {
      setNewPickup(index)
      setMode("Dropoff")
    }
  }

  // Delete the associated cargo pickup and dropoff with the index of one
  function deleteCargo(index) {
    const cargoIndex = Math.max(cargoPickups.indexOf(index), cargoDropoffs.indexOf(index))
    let newPickups = [...cargoPickups]
    newPickups.splice(cargoIndex, 1)
    setCargoPickups(newPickups);
    let newDropoffs = [...cargoDropoffs]
    newDropoffs.splice(cargoIndex, 1)
    setCargoDropoffs(newDropoffs)
    setChanged(true)
  }

  // Get the tile associated with each board entry value
  function getTile(tile, index) {
    switch (tile[0]) {
      case "T":
        return  (
          <TruckTile 
            direction={tile[1]}
            color={COLORS[tile[2]]}
          />
        )
      case "P":
        return (
          <PickupTile 
            onClick={() => edit && deleteCargo(index)}
            color={COLORS[tile[1]]} 
          />
        )
      case "D": 
        return (
          <DropoffTile 
            onClick={() => edit && deleteCargo(index)}
            color={COLORS[tile[1]]} 
          />
        )
      case "-":
        return (
          <EmptyTile 
            color={getColor()}
            background={COLORS[tile[1]]}
            mode={mode}
            edit={edit && canAddMore()}
            changeMode={() => changeMode(index)}
          />
        )
    }
  }

  // Create board given truck location, cargo pickups and dropoffs, and dimensions
  function makeBoard() {
    let location = gameMode ? game[frame].truck_location : truckLocation;
    let route = gameMode ? game[frame].cargo_destination : null
    let pickups = gameMode ? [cargoPickups[route]] : cargoPickups;
    let dropoffs = gameMode ? [cargoDropoffs[route]] : cargoDropoffs;

    let position = 0
    let board = []

    let direction;
    if (gameMode) {
      if (frame === 0) {
        if (isMovement(game[frame + 1].action)) {
          direction = game[frame + 1].action[0]
        } else {
          direction = game[frame + 2].action[0]
        }
      } else if (frame + 1 === game.length) {
        direction = game[frame - 1].action[0]
      } else {
        if (isMovement(game[frame].action)) {
          direction = game[frame].action[0]
        } else {
          direction = game[frame + 1].action[0]
        }
      }
    }

    for (let i = 0; i < height; i++) {
      let row = []

      for (let j = 0; j < width; j++) {
        if (position === location) {
          if (pickups.includes(position) || dropoffs.includes(position)) {
            const color = Object.keys(COLORS)[route]
            row.push(`T${direction}${color}`)
          } else {
            row.push(`T${direction}-`)
          }
        } else if (pickups.includes(position)) {
          if (gameMode) {
            const color = Object.keys(COLORS)[route]
            if (game[frame].cargo_location === cargoPickups.length) {
              row.push("-" + color)
            } else {
              row.push("P" + color)
            }
          } else {
            const color = Object.keys(COLORS)[pickups.indexOf(position)]
            row.push("P" + color)
          }
        } else if (dropoffs.includes(position)) {
          const color = gameMode ? Object.keys(COLORS)[route] : Object.keys(COLORS)[dropoffs.indexOf(position)]
          row.push("D" + color)
        } else {
          row.push("--")
        }
        position++
      }

      board.push(row)
    }

    return board
  }

  // Start a playback of the game sent from the backend
  function playGame() {
    if (!gameMode && game.length > 0) {
      setGameMode(true)
    } else {
      setGameMode(false)
      setFrame(0)
    }
  }

  // Increment to the next game frame playback, or end the game playback if its the last frame
  function changeFrame(value) {
    if (frame + value >= 0 && frame + value < game.length && gameMode) {
      setFrame(frame + value)
    } else if (frame + value === game.length) {
      setFrame(0)
      setGameMode(false)
    }
  }

  return (
    <Section>
      <Flex mt="20px">
        <BackwardButton onClick={() => changeFrame(-1)} disabled={!gameMode}/>
        <PlayButton gameMode={gameMode} onClick={playGame} disabled={loading || edit || game.length === 0 || changed}/>
        <ForwardButton onClick={() => changeFrame(1)} disabled={!gameMode}/>
      </Flex>
      <Flex w="200px" h="40px">
        <Slider
          style={{ color: '#3BB9A2' }}
          value={frame}
          step={1}
          min={0}
          max={game.length - 1}
          onChange={(e, v) =>  setFrame(v)}
          disabled={!gameMode || edit}
          marks
        />
      </Flex>
      <Flex 
        w={`${makeBoard()[0].length * 55 + 5}px`}
        w="225px"
        ai="center" 
        jc="flex-end" 
        pr="10px"
        mb="10px"
      >
        <Button 
          mr="10px"
          h="33px"
          w="80px"
          color="#3BB9A2"
          onClick={trainModel}
          primary
          disabled={loading || edit || gameMode || !changed || cargoPickups.length === 0}
        >
          {loading ?
            <CircularProgress 
              size="22px"
              style={{ color: 'white', marginTop: 4 }} 
            />
          : 'Train' }
        </Button>
        <Button 
          mr="10px"
          h="33px"
          w="80px"
          color="#3BB9A2"
          onClick={runModel}
          primary
          disabled={loading || edit || gameMode || changed || matrix.length === 0}
        >
          Run
        </Button>
        <EditButton 
          edit={edit} 
          disabled={loading || gameMode}
          onClick={() => !loading && setEdit(!edit)}
        />
      </Flex>
      <Flex 
        fw="wrap" 
        w={`${makeBoard()[0].length * 55 + 5}px`}
        h={`${makeBoard().length * 55}px`}
        ai="flex-start"
        pb="5px"
      >
        {makeBoard().map((row, y) => row.map((tile, x) => getTile(tile, y * width + x)))}
      </Flex>
      <Flex ai="center" jc="center" h="24px">
        <Text fs="16px" fw="bold" mr="4px">W:</Text>
        <Input 
          value={width}
          onChange={e => {
            setWidth(e.target.value) 
            setChanged(true)
          }}
          disabled={!edit}
          type="number" step="1" min="1" max="7" w="30px" h="20px" 
        />
        <Text fs="16px" fw="bold" ml="16px" mr="4px">H:</Text>
        <Input 
          value={height}
          onChange={e => {
            setHeight(e.target.value)
            setChanged(true)
          }}
          disabled={!edit}
          type="number" step="1" min="1" max="7" w="30px" h="20px" mr="20px"
        />
      </Flex>
    </Section>
  )
}