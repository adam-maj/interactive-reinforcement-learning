import React from "react";
import { Box } from '../../styles/main/MainStyles';

export default function EditButton({ edit, onClick }) {
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