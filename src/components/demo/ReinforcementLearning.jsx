import React, { useState } from 'react'
import { Section, Flex, Box } from '../../styles/main/MainStyles';
import { TruckTile, PackageTile, StoreTile } from './Tiles'

export default function ReinforcementLearning() {
  const [truckX, setTruckX] = useState(0);
  const [truckY, setTruckY] = useState(0);
  const [board, setBoard] = useState([
    [0, 0, 0, 0, 0],
    [0, 0, 0, "PB", 0],
    [0, 0, 0, 0, 0],
    [0, "TU", 0 ,0, 0],
    ["SR", 0, 0, 0, 0]
  ])

  const colors = {
    "B": "#3BB9A2",
    "R": "#9C2C2C"
  }

  function getTile(tile) {
    switch (tile[0]) {
      case "T":
        return <TruckTile direction={tile[1]} />
      case "P":
        return <PackageTile color={colors[tile[1]]}/>
      case "S": 
        return <StoreTile color={colors[tile[1]]}/>
      default:
        return <Box w="50px" h="50px" br="10px" bg="#999999" ml="5px" />
    }
  }

  function makeBoard() {
    return board
  }

  return (
    <Section>
      <Flex 
        fw="wrap" 
        w={`${board[0].length * 55 + 5}px`}
        h={`${board.length * 55}px`}
        ai="flex-start"
        pb="5px"
      >
        {makeBoard().map(row => row.map(tile => getTile(tile)))}
      </Flex>
    </Section>
  )
}

