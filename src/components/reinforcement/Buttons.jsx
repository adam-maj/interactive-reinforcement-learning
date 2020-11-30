import React from "react";
import { Box } from '../../styles/main/MainStyles';

export function EditButton({ edit, onClick }) {
  return (
    <Box 
      onClick={onClick}
      h="33px" w="33px" bg="#3BB9A2" br="50px" pl="10px" cursor="pointer"
    >
      {!edit && <i className="fas fa-pencil-alt"></i>}
      {edit && <i className="fas fa-check"></i>}
    </Box>
  )
}

export function PlayButton({ gameMode, onClick }) {
  return (
    <Box 
      onClick={onClick}
      h="33px" w="33px" bg="#3BB9A2" br="50px" pl="10px" cursor="pointer"
    >
      {!gameMode && <i style={{ marginLeft: 2, marginTop: 2 }} class="fas fa-play fa-sm" />}
      {gameMode && <i class="fas fa-pause" />}
    </Box>
  )
}

export function ForwardButton({ onClick }) {
  return (
    <Box 
      onClick={onClick}
      h="33px" w="33px" bg="#3BB9A2" ml="8px"
      br="50px" pl="10px" cursor="pointer"
    >
      <i class="fas fa-fast-forward"></i>
    </Box>
  )
}

export function BackwardButton({ onClick }) {
  return (
    <Box 
      onClick={onClick}
      h="33px" w="33px" bg="#3BB9A2" mr="8px"
      br="50px" pl="10px" cursor="pointer"
    >
      <i style={{ transform: "rotate(180deg)" }} class="fas fa-fast-forward"></i>
    </Box>
  )
}