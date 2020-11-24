import React, { useState, useEffect } from 'react'
import { Section, Flex, Button, Input, Text } from '../styles/main/MainStyles';
import TruckTile from './reinforcement/TruckTile';
import EmptyTile from './reinforcement/EmptyTile';
import PickupTile from './reinforcement/PickupTile';
import DropoffTile from './reinforcement/DropoffTile';
import EditButton from './reinforcement/EditButton';
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

  // Run game state
  const [truckLocation, setTruckLocation] = useState(null);

  // Model and game states
  const [matrix, setMatrix] = useState([]);
  const [game, setGame] = useState([]);
  const [loading, setLoading] = useState(false);

  // Pickup and dropoff tile colors
  const COLORS = {
    "B": "#306BFF",
    "R": "#E13131",
    "Y": "#DA9716",
    "P": "#E249CA"
  }

  // Reset edit mode state on new edit instance
  useEffect(() => {
    setMode("Pickup")
  }, [edit])

  // Send current board to API to train model
  function getModel() {
    setLoading(true)
    api
      .train({
        width: parseInt(width),
        height: parseInt(height),
        cargoPickups: cargoPickups,
        cargoDropoffs: cargoDropoffs
      })
      .then(res => {
        setMatrix(res)
        setLoading(false)
      })
  }

  function runModel() {
    api
      .run({
        matrix: matrix,
        truckLocation: truckLocation,
        width: parseInt(width),
        height: parseInt(height),
        cargoPickups: cargoPickups,
        cargoDropoffs: cargoDropoffs
      })
      .then(res => {
        setGame(res)
        console.log(res)
      })
  }

  // Return color of next cargo pickup/dropoff the user can add
  function getColor() {
    return COLORS[Object.keys(COLORS)[cargoPickups.length]];
  }

  // Returns true if more cargo locations can be added to the board
  function canAddMore() {
    return cargoPickups.length < Object.keys(COLORS).length;
  }

  // Change edit mode and add cargo pickups and dropoffs by pair
  function changeMode(index) {
    if (mode === "Dropoff") {
      setCargoPickups([...cargoPickups, newPickup])
      setCargoDropoffs([...cargoDropoffs, index])
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
  }

  // Get the tile associated with each board entry value
  function getTile(tile, index) {
    switch (tile[0]) {
      case "T":
        return <TruckTile direction={tile[1]} />
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
      default:
        return (
          <EmptyTile 
            color={getColor()}  
            mode={mode}
            edit={edit && canAddMore()}
            changeMode={() => changeMode(index)}
          />
        )
    }
  }

  // Create board given truck location, cargo pickups and dropoffs, and dimensions
  function makeBoard() {
    let position = 0
    let board = []

    for (let i = 0; i < height; i++) {
      let row = []

      for (let j = 0; j < width; j++) {
        if (position === truckLocation) {
          row.push("TU")
        } else if (cargoPickups.includes(position)) {
          const color = Object.keys(COLORS)[cargoPickups.indexOf(position)]
          row.push("P" + color)
        } else if (cargoDropoffs.includes(position)) {
          const color = Object.keys(COLORS)[cargoDropoffs.indexOf(position)]
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

  return (
    <Section>
      <Flex 
        w={`${makeBoard()[0].length * 55 + 5}px`}
        ai="center" 
        jc="flex-end" 
        pr="10px"
        mb="10px"
      >
        <EditButton 
          edit={edit} 
          onClick={() => setEdit(!edit)}
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
      <Flex ai="center" jc="center">
        <Text fs="16px" fw="bold" mr="4px">W:</Text>
        <Input 
          value={width}
          onChange={e => {
            setWidth(e.target.value)
            setEdit(false)  
          }}
          type="number" step="1" min="1" max="7" w="30px" h="20px" 
        />
        <Text fs="16px" fw="bold" ml="16px" mr="4px">H:</Text>
        <Input 
          value={height}
          onChange={e => {
            setHeight(e.target.value)
            setEdit(false)
          }}
          type="number" step="1" min="1" max="7" w="30px" h="20px" mr="20px"
        />
      </Flex>
      <Button mt="10px" onClick={getModel} disabled={loading}>Train</Button>
      <Button mt="10px" onClick={runModel} disabled={loading}>Run</Button>
    </Section>
  )
}

