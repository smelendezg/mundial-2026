// src/theme.ts 

import { createTheme, alpha } from "@mui/material/styles"; 

 

const PRIMARY = "#2EE59D"; 

const SECONDARY = "#FFD166"; 

const BG0 = "#04140D"; 

const BG1 = "#071B12"; 

const PAPER = "#0B2418"; 

 

export const theme = createTheme({ 

  palette: { 

    mode: "dark", 

    primary: { main: PRIMARY }, 

    secondary: { main: SECONDARY }, 

    background: { 

      default: BG1, 

      paper: alpha(PAPER, 0.55), 

    }, 

    text: { 

      primary: "#EAF2FF", 

      secondary: alpha("#EAF2FF", 0.78), 

    }, 

    divider: alpha("#EAF2FF", 0.12), 

  }, 

 

  shape: { borderRadius: 8 }, 

 

  typography: { 

    fontFamily: ["Inter", "system-ui", "Segoe UI", "Roboto", "Arial"].join(","), 

    h5: { fontWeight: 900, letterSpacing: 0.2 }, 

    h6: { fontWeight: 800 }, 

    button: { fontWeight: 800 }, 

  }, 

 

  components: { 

    MuiCssBaseline: { 

      styleOverrides: { 

        body: { 

          minHeight: "100vh", 

          background: 

            "linear-gradient(135deg, rgba(4,20,13,.92) 0%, rgba(7,42,25,.88) 52%, rgba(9,18,12,.96) 100%)," +

            "url(https://images.unsplash.com/photo-1508098682722-e99c43a406b2?auto=format&fit=crop&w=1800&q=80)", 

          backgroundAttachment: "fixed", 
          backgroundSize: "cover",
          backgroundPosition: "center",

        }, 

 

        // Scrollbar bonita (Chrome/Edge) 

        "*::-webkit-scrollbar": { width: 10, height: 10 }, 

        "*::-webkit-scrollbar-thumb": { 

          background: alpha("#EAF2FF", 0.18), 

          borderRadius: 99, 

          border: `2px solid ${alpha(BG0, 0.6)}`, 

        }, 

        "*::-webkit-scrollbar-thumb:hover": { 

          background: alpha("#EAF2FF", 0.28), 

        }, 

      }, 

    }, 

 

    MuiPaper: { 

      styleOverrides: { 

        root: { 

          position: "relative", 

          overflow: "hidden", 

          backdropFilter: "blur(14px)", 

          border: `1px solid ${alpha("#EAF2FF", 0.12)}`, 

          backgroundImage: 

            `linear-gradient(180deg, ${alpha("#FFFFFF", 0.06)} 0%, ${alpha( 

              "#FFFFFF", 

              0.02 

            )} 100%)`, 

          boxShadow: "0 18px 60px rgba(0,0,0,.45)", 

 

          // brillo suave arriba 

          "&::before": { 

            content: '""', 

            position: "absolute", 

            inset: 0, 

            pointerEvents: "none", 

            background: 

              "radial-gradient(600px circle at 20% 0%, rgba(46,229,157,.18), transparent 60%)," + 

              "radial-gradient(600px circle at 90% 10%, rgba(255,209,102,.14), transparent 55%)", 

            opacity: 0.9, 

          }, 

        }, 

      }, 

    }, 

 

    MuiButton: { 

      styleOverrides: { 

        root: { 

          borderRadius: 8, 

          textTransform: "none", 

          fontWeight: 800, 

          transition: 

            "transform .15s ease, box-shadow .2s ease, background-color .2s ease", 

          "&:active": { transform: "scale(0.98)" }, 

        }, 

 

        contained: { 

          boxShadow: `0 10px 28px ${alpha(PRIMARY, 0.25)}`, 

          backgroundImage: `linear-gradient(135deg, ${PRIMARY} 0%, ${alpha( 

            SECONDARY, 

            0.9 

          )} 100%)`, 

          "&:hover": { 

            boxShadow: `0 14px 40px ${alpha(PRIMARY, 0.35)}`, 

            transform: "translateY(-1px)", 

          }, 

        }, 

 

        outlined: { 

          borderColor: alpha("#EAF2FF", 0.22), 

          "&:hover": { 

            borderColor: alpha("#EAF2FF", 0.35), 

            backgroundColor: alpha("#EAF2FF", 0.06), 

            transform: "translateY(-1px)", 

          }, 

        }, 

      }, 

    }, 

 

    MuiTextField: { 

      defaultProps: { fullWidth: true }, 

    }, 

 

    MuiOutlinedInput: { 

      styleOverrides: { 

        root: { 

          borderRadius: 8, 

          backgroundColor: alpha("#000", 0.12), 

          transition: "box-shadow .2s ease, transform .2s ease", 

          "&:hover": { 

            boxShadow: `0 0 0 3px ${alpha(PRIMARY, 0.12)}`, 

          }, 

          "&.Mui-focused": { 

            boxShadow: `0 0 0 4px ${alpha(PRIMARY, 0.18)}`, 

            transform: "translateY(-1px)", 

          }, 

        }, 

        notchedOutline: { 

          borderColor: alpha("#EAF2FF", 0.18), 

        }, 

      }, 

    }, 

 

    MuiInputLabel: { 

      styleOverrides: { 

        root: { 

          color: alpha("#EAF2FF", 0.72), 

          "&.Mui-focused": { 

            color: alpha(PRIMARY, 0.95), 

          }, 

        }, 

      }, 

    }, 

 

    MuiMenuItem: { 

      styleOverrides: { 

        root: { 

          borderRadius: 12, 

        }, 

      }, 

    }, 

 

    MuiAlert: { 

      styleOverrides: { 

        root: { 

          borderRadius: 16, 

          border: `1px solid ${alpha("#EAF2FF", 0.14)}`, 

          backdropFilter: "blur(12px)", 

        }, 

        standardInfo: { 

          backgroundColor: alpha(PRIMARY, 0.12), 

        }, 

        standardSuccess: { 

          backgroundColor: alpha("#2EE59D", 0.12), 

        }, 

        standardError: { 

          backgroundColor: alpha("#FF4D6D", 0.12), 

        }, 

      }, 

    }, 

 

    MuiDivider: { 

      styleOverrides: { 

        root: { 

          borderColor: alpha("#EAF2FF", 0.12), 

        }, 

      }, 

    }, 

 

    MuiTooltip: { 

      styleOverrides: { 

        tooltip: { 

          borderRadius: 12, 

          backgroundColor: alpha("#082015", 0.92), 

          border: `1px solid ${alpha("#EAF2FF", 0.12)}`, 

          backdropFilter: "blur(10px)", 

        }, 

      }, 

    }, 

  }, 

}); 
