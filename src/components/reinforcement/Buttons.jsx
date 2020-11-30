import React from "react";
import { Box } from '../../styles/main/MainStyles';

function Button({ toggle, disabled, onClick, activeIcon, inactiveIcon}) {
  return (
    <Box
      onClick={onClick}
      h="33px" w="33px" bg="#3BB9A2" br="50px" 
      pl="10px" cursor={disabled ? "default" : "pointer"}
    >
      {toggle ? 
        <i 
          className={`fas ${activeIcon}`} 
          style={{ color: disabled ? 'rgba(255, 255, 255, 0.6)' : 'white' }}
        />
      :
        <i 
          className={`fas ${inactiveIcon}`} 
          style={{ color: disabled ? 'rgba(255, 255, 255, 0.6)' : 'white' }}
        />
      }
    </Box>
  )
}

export function EditButton({ disabled, edit, onClick }) {
  return (
    <Button 
      toggle={edit} 
      disabled={disabled} 
      onClick={onClick} 
      activeIcon="fa-check" 
      inactiveIcon="fa-pencil-alt"
    />
  )
}

export function PlayButton({ disabled, gameMode, onClick }) {
  return (
    <Button 
      toggle={gameMode}
      disabled={disabled}
      onClick={onClick}
      activeIcon="fa-pause"
      inactiveIcon="fa-play fa-sm"
    />
  )
}

export function ForwardButton({ disabled, onClick }) {
  return (
    <Box 
      onClick={onClick}
      h="33px" w="33px" bg="#3BB9A2" ml="8px"
      br="50px" pl="10px" cursor={disabled ? "default" : "pointer"}
    >
      <i 
        class="fas fa-fast-forward"
        style={{ color: disabled ? 'rgba(255, 255, 255, 0.6)' : 'white' }}
      />
    </Box>
  )
}

export function BackwardButton({ disabled, onClick }) {
  return (
    <Box 
      onClick={onClick}
      h="33px" w="33px" bg="#3BB9A2" mr="8px"
      br="50px" pl="10px" cursor={disabled ? "default" : "pointer"}
    >
      <i 
        class="fas fa-fast-forward"
        style={{ 
          transform: "rotate(180deg)", 
          color: disabled ? 'rgba(255, 255, 255, 0.6)' : 'white' 
        }}
      />
    </Box>
  )
}