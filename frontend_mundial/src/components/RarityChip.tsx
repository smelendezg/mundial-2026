// src/components/RarityChip.tsx 

import { Chip } from "@mui/material"; 

import type { Sticker } from "../types/sticker"; 

 

type Props = { rarity: Sticker["rarity"] }; 

 

const map = (rarity: Props["rarity"]) => { 

  switch (rarity) { 

    case "legend": 

      return { 

        label: "Legend", 

        sx: { 

          bgcolor: "rgba(255, 196, 0, .16)", 

          borderColor: "rgba(255, 196, 0, .55)", 

          color: "rgba(255, 234, 170, .95)", 

          boxShadow: "0 0 18px rgba(255,196,0,.25)", 

        }, 

      }; 

    case "rare": 

      return { 

        label: "Rare", 

        sx: { 

          bgcolor: "rgba(142, 162, 255, .16)", 

          borderColor: "rgba(142, 162, 255, .55)", 

          color: "rgba(224, 231, 255, .95)", 

          boxShadow: "0 0 18px rgba(142,162,255,.22)", 

        }, 

      }; 

    default: 

      return { 

        label: "Common", 

        sx: { 

          bgcolor: "rgba(46, 229, 157, .12)", 

          borderColor: "rgba(46, 229, 157, .45)", 

          color: "rgba(214, 255, 238, .92)", 

          boxShadow: "0 0 14px rgba(46,229,157,.16)", 

        }, 

      }; 

  } 

}; 

 

export default function RarityChip({ rarity }: Props) { 

  const r = map(rarity); 

  return ( 

    <Chip 

      size="small" 

      variant="outlined" 

      label={r.label} 

      sx={{ 

        borderRadius: 999, 

        fontWeight: 900, 

        letterSpacing: 0.4, 

        ...r.sx, 

      }} 

    /> 

  ); 

} 