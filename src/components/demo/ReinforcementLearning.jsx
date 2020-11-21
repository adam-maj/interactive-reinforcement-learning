import React, { useState } from 'react'
import { Section, Flex, Box } from '../../styles/main/MainStyles';

export default function ReinforcementLearning() {
  const board = [
    [0, 0, 0, 1, 0, 0, 0],
    [0, 0, 0, 1, 0, 0, 0],
    [0, 1, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 0],
    [0, 0, 0, 2, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0]
  ]

  function getColor(value) {
    switch (value) {
      case 0:
        return "white"
      case 1: 
        return "red"
      case 2:
        return "blue"
    }
  }

  return (
    <Section>
      <Flex 
        fw="wrap" 
        w="320px"
        h="320px" 
        bg="black" 
        ai="flex-start"
        pb="5px"
      >
        {board.map(row => row.map(tile => 
          <Box
            w="40px" h="40px" 
            br="5px" bg={getColor(tile)}
            m="5px 0px 0px 5px"
          />
        ))}
      </Flex>
    </Section>
  )
}

