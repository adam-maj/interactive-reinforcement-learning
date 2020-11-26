import React, { useState, useEffect } from 'react'
import { Box } from '../../styles/main/MainStyles';
import PickupTile from './PickupTile';
import DropoffTile from './DropoffTile';

export default function EmptyTile({ color, background, mode, edit, changeMode }) {
  const [hover, setHover] = useState(false);
  const [final, setFinal] = useState(false);
  const [tile, setTile] = useState();
  const [finalColor, setFinalColor] = useState();

  const TILES = {
    "Pickup": PickupTile,
    "Dropoff": DropoffTile
  }
  const Tile = TILES[final && tile || mode]

  useEffect(() => {
    setFinal(false)
    setHover(false)
  }, [edit])

  if (final && edit) {
    return (
      <Tile color={finalColor} />
    )
  }

  if (hover && edit) {
    return (
      <Tile
        onClick={() => {
          setFinal(true)
          setTile(mode)
          setFinalColor(color)
          changeMode()
        }}
        onMouseLeave={() => setHover(false)}
        color={color}
      />
    )
  }

  return (
    <Box 
      onMouseEnter={() => edit && setHover(true)}
      w="50px" h="50px" br="10px" bg={background} ml="5px" 
    />
  )
}
