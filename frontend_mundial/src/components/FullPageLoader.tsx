import { CircularProgress, Stack, Typography } from "@mui/material"; 

 

export default function FullPageLoader({ text = "Cargando..." }: { text?: string }) { 

  return ( 

    <Stack 

      alignItems="center" 

      justifyContent="center" 

      spacing={2} 

      sx={{ minHeight: "70vh" }} 

    > 

      <CircularProgress /> 

      <Typography color="text.secondary">{text}</Typography> 

    </Stack> 

  ); 

} 