# Script to transform T20 match cards to new professional format

$file = "c:\Users\bitbu\OneDrive\Documents\GitHub\PickAI\Sports\T20-World-Cup.html"
$content = Get-Content $file -Raw -Encoding UTF8

# Define match data with team pairs and their details
# Format: @{Team1="Name"; Team1Flag="code"; Team2="Name"; Team2Flag="code"; Venue="Location"; Time="HH:MM"}

$matches = @(
    # Feb 9, 2026
    @{N = 7; Stage = "Group Stage"; T1 = "Scotland"; F1 = "sco"; T2 = "Italy"; F2 = "ita"; V = "Eden Gardens, Kolkata"; Time = "11:00 AM" },
    @{N = 8; Stage = "Group Stage"; T1 = "Zimbabwe"; F1 = "zim"; T2 = "Oman"; F2 = "oma"; V = "Sinhalese Sports Club, Colombo"; Time = "15:00 (3:00 PM)" },
    @{N = 9; Stage = "Group Stage"; T1 = "South Africa"; F1 = "sa"; T2 = "Canada"; F2 = "can"; V = "Wankhede Stadium, Mumbai"; Time = "19:00 (7:00 PM)" },
    
    # Feb 10, 2026
    @{N = 10; Stage = "Group Stage"; T1 = "Netherlands"; F1 = "ned"; T2 = "Namibia"; F2 = "nam"; V = "Narendra Modi Stadium, Ahmedabad"; Time = "11:00 AM" },
    @{N = 11; Stage = "Group Stage"; T1 = "New Zealand"; F1 = "nz"; T2 = "UAE"; F2 = "uae"; V = "MA Chidambaram Stadium, Chennai"; Time = "15:00 (3:00 PM)" },
    @{N = 12; Stage = "Group Stage"; T1 = "Pakistan"; F1 = "pak"; T2 = "USA"; F2 = "usa"; V = "Eden Gardens, Kolkata"; Time = "19:00 (7:00 PM)" },
    
    # Feb 11, 2026
    @{N = 13; Stage = "Group Stage"; T1 = "South Africa"; F1 = "sa"; T2 = "Afghanistan"; F2 = "afg"; V = "Wankhede Stadium, Mumbai"; Time = "11:00 AM" },
    @{N = 14; Stage = "Group Stage"; T1 = "Australia"; F1 = "aus"; T2 = "Ireland"; F2 = "ire"; V = "R.Premadasa Stadium, Colombo"; Time = "15:00 (3:00 PM)" },
    @{N = 15; Stage = "Group Stage"; T1 = "England"; F1 = "eng"; T2 = "West Indies"; F2 = "wi"; V = "Narendra Modi Stadium, Ahmedabad"; Time = "19:00 (7:00 PM)" },
    
    # Feb 12, 2026
    @{N = 16; Stage = "Group Stage"; T1 = "Sri Lanka"; F1 = "sl"; T2 = "Oman"; F2 = "oma"; V = "Sinhalese Sports Club, Colombo"; Time = "11:00 AM" },
    @{N = 17; Stage = "Group Stage"; T1 = "Nepal"; F1 = "nep"; T2 = "Italy"; F2 = "ita"; V = "MA Chidambaram Stadium, Chennai"; Time = "15:00 (3:00 PM)" },
    @{N = 18; Stage = "Group Stage"; T1 = "India"; F1 = "ind"; T2 = "Namibia"; F2 = "nam"; V = "Eden Gardens, Kolkata"; Time = "19:00 (7:00 PM)" },
    
    # Feb 13, 2026
    @{N = 19; Stage = "Group Stage"; T1 = "Australia"; F1 = "aus"; T2 = "Zimbabwe"; F2 = "zim"; V = "R.Premadasa Stadium, Colombo"; Time = "11:00 AM" },
    @{N = 20; Stage = "Group Stage"; T1 = "Canada"; F1 = "can"; T2 = "UAE"; F2 = "uae"; V = "Wankhede Stadium, Mumbai"; Time = "15:00 (3:00 PM)" },
    @{N = 21; Stage = "Group Stage"; T1 = "USA"; F1 = "usa"; T2 = "Netherlands"; F2 = "ned"; V = "Narendra Modi Stadium, Ahmedabad"; Time = "19:00 (7:00 PM)" },
    
    # Feb 14, 2026
    @{N = 22; Stage = "Group Stage"; T1 = "Ireland"; F1 = "ire"; T2 = "Oman"; F2 = "oma"; V = "Sinhalese Sports Club, Colombo"; Time = "11:00 AM" },
    @{N = 23; Stage = "Group Stage"; T1 = "England"; F1 = "eng"; T2 = "Scotland"; F2 = "sco"; V = "MA Chidambaram Stadium, Chennai"; Time = "15:00 (3:00 PM)" },
    @{N = 24; Stage = "Group Stage"; T1 = "New Zealand"; F1 = "nz"; T2 = "South Africa"; F2 = "sa"; V = "Eden Gardens, Kolkata"; Time = "19:00 (7:00 PM)" },
    
    # Feb 15, 2026
    @{N = 25; Stage = "Group Stage"; T1 = "West Indies"; F1 = "wi"; T2 = "Nepal"; F2 = "nep"; V = "Wankhede Stadium, Mumbai"; Time = "11:00 AM" },
    @{N = 26; Stage = "Group Stage"; T1 = "USA"; F1 = "usa"; T2 = "Namibia"; F2 = "nam"; V = "Narendra Modi Stadium, Ahmedabad"; Time = "15:00 (3:00 PM)" },
    @{N = 27; Stage = "Group Stage"; T1 = "India"; F1 = "ind"; T2 = "Pakistan"; F2 = "pak"; V = "Narendra Modi Stadium, Ahmedabad"; Time = "19:00 (7:00 PM)" },
    
    # Feb 16, 2026
    @{N = 28; Stage = "Group Stage"; T1 = "Afghanistan"; F1 = "afg"; T2 = "UAE"; F2 = "uae"; V = "MA Chidambaram Stadium, Chennai"; Time = "11:00 AM" },
    @{N = 29; Stage = "Group Stage"; T1 = "England"; F1 = "eng"; T2 = "Italy"; F2 = "ita"; V = "Eden Gardens, Kolkata"; Time = "15:00 (3:00 PM)" },
    @{N = 30; Stage = "Group Stage"; T1 = "Australia"; F1 = "aus"; T2 = "Sri Lanka"; F2 = "sl"; V = "R.Premadasa Stadium, Colombo"; Time = "19:00 (7:00 PM)" },
    
    # Feb 17, 2026
    @{N = 31; Stage = "Group Stage"; T1 = "New Zealand"; F1 = "nz"; T2 = "Canada"; F2 = "can"; V = "Wankhede Stadium, Mumbai"; Time = "11:00 AM" },
    @{N = 32; Stage = "Group Stage"; T1 = "Ireland"; F1 = "ire"; T2 = "Zimbabwe"; F2 = "zim"; V = "Sinhalese Sports Club, Colombo"; Time = "15:00 (3:00 PM)" },
    @{N = 33; Stage = "Group Stage"; T1 = "Scotland"; F1 = "sco"; T2 = "Nepal"; F2 = "nep"; V = "MA Chidambaram Stadium, Chennai"; Time = "19:00 (7:00 PM)" },
    
    # Feb 18, 2026
    @{N = 34; Stage = "Group Stage"; T1 = "South Africa"; F1 = "sa"; T2 = "UAE"; F2 = "uae"; V = "Narendra Modi Stadium, Ahmedabad"; Time = "11:00 AM" },
    @{N = 35; Stage = "Group Stage"; T1 = "Pakistan"; F1 = "pak"; T2 = "Namibia"; F2 = "nam"; V = "Eden Gardens, Kolkata"; Time = "15:00 (3:00 PM)" },
    @{N = 36; Stage = "Group Stage"; T1 = "India"; F1 = "ind"; T2 = "Netherlands"; F2 = "ned"; V = "Narendra Modi Stadium, Ahmedabad"; Time = "19:00 (7:00 PM)" },
    
    # Feb 19, 2026
    @{N = 37; Stage = "Group Stage"; T1 = "West Indies"; F1 = "wi"; T2 = "Italy"; F2 = "ita"; V = "Wankhede Stadium, Mumbai"; Time = "11:00 AM" },
    @{N = 38; Stage = "Group Stage"; T1 = "Sri Lanka"; F1 = "sl"; T2 = "Zimbabwe"; F2 = "zim"; V = "R.Premadasa Stadium, Colombo"; Time = "15:00 (3:00 PM)" },
    @{N = 39; Stage = "Group Stage"; T1 = "Afghanistan"; F1 = "afg"; T2 = "Canada"; F2 = "can"; V = "MA Chidambaram Stadium, Chennai"; Time = "19:00 (7:00 PM)" },
    
    # Feb 20, 2026
    @{N = 40; Stage = "Group Stage"; T1 = "Australia"; F1 = "aus"; T2 = "Oman"; F2 = "oma"; V = "Sinhalese Sports Club, Colombo"; Time = "11:00 AM" },
    @{N = 41; Stage = "Group Stage"; T1 = "England"; F1 = "eng"; T2 = "Nepal"; F2 = "nep"; V = "Eden Gardens, Kolkata"; Time = "15:00 (3:00 PM)" },
    @{N = 42; Stage = "Group Stage"; T1 = "Pakistan"; F1 = "pak"; T2 = "Netherlands"; F2 = "ned"; V = "Narendra Modi Stadium, Ahmedabad"; Time = "19:00 (7:00 PM)" },
    
    # Feb 21, 2026 - Super 8 starts
    @{N = 43; Stage = "Super 8 Match 1"; T1 = "TBC"; F1 = "tbc"; T2 = "TBC"; F2 = "tbc"; V = "Eden Gardens, Kolkata"; Time = "19:00 (7:00 PM)" },
    @{N = 44; Stage = "Super 8 Match 2"; T1 = "TBC"; F1 = "tbc"; T2 = "TBC"; F2 = "tbc"; V = "Wankhede Stadium, Mumbai"; Time = "19:00 (7:00 PM)" },
    
    # Feb 22, 2026
    @{N = 45; Stage = "Super 8 Match 3"; T1 = "TBC"; F1 = "tbc"; T2 = "TBC"; F2 = "tbc"; V = "R.Premadasa Stadium, Colombo"; Time = "19:00 (7:00 PM)" },
    @{N = 46; Stage = "Super 8 Match 4"; T1 = "TBC"; F1 = "tbc"; T2 = "TBC"; F2 = "tbc"; V = "Narendra Modi Stadium, Ahmedabad"; Time = "19:00 (7:00 PM)" },
    
    # Feb 24, 2026
    @{N = 47; Stage = "Super 8 Match 5"; T1 = "TBC"; F1 = "tbc"; T2 = "TBC"; F2 = "tbc"; V = "Wankhede Stadium, Mumbai"; Time = "19:00 (7:00 PM)" },
    @{N = 48; Stage = "Super 8 Match 6"; T1 = "TBC"; F1 = "tbc"; T2 = "TBC"; F2 = "tbc"; V = "Eden Gardens, Kolkata"; Time = "19:00 (7:00 PM)" },
    
    # Feb 25, 2026
    @{N = 49; Stage = "Super 8 Match 7"; T1 = "TBC"; F1 = "tbc"; T2 = "TBC"; F2 = "tbc"; V = "Narendra Modi Stadium, Ahmedabad"; Time = "19:00 (7:00 PM)" },
    @{N = 50; Stage = "Super 8 Match 8"; T1 = "TBC"; F1 = "tbc"; T2 = "TBC"; F2 = "tbc"; V = "MA Chidambaram Stadium, Chennai"; Time = "19:00 (7:00 PM)" },
    
    # Feb 27, 2026
    @{N = 51; Stage = "Super 8 Match 9"; T1 = "TBC"; F1 = "tbc"; T2 = "TBC"; F2 = "tbc"; V = "R.Premadasa Stadium, Colombo"; Time = "19:00 (7:00 PM)" },
    @{N = 52; Stage = "Super 8 Match 10"; T1 = "TBC"; F1 = "tbc"; T2 = "TBC"; F2 = "tbc"; V = "Wankhede Stadium, Mumbai"; Time = "19:00 (7:00 PM)" },
    
    # Mar 1, 2026
    @{N = 53; Stage = "Super 8 Match 11"; T1 = "TBC"; F1 = "tbc"; T2 = "TBC"; F2 = "tbc"; V = "Eden Gardens, Kolkata"; Time = "19:00 (7:00 PM)" },
    @{N = 54; Stage = "Super 8 Match 12"; T1 = "TBC"; F1 = "tbc"; T2 = "TBC"; F2 = "tbc"; V = "MA Chidambaram Stadium, Chennai"; Time = "19:00 (7:00 PM)" },
    
    # Mar 4, 2026 - Semi-Final 1
    @{N = 55; Stage = "Semi-Final 1"; T1 = "TBC"; F1 = "tbc"; T2 = "TBC"; F2 = "tbc"; V = "Venue To#Be Confirmed"; Time = "19:00 (7:00 PM)" },
    
    # Mar 5, 2026 - Semi-Final 2
    @{N = 56; Stage = "Semi-Final 2"; T1 = "TBC"; F1 = "tbc"; T2 = "TBC"; F2 = "tbc"; V = "Wankhede Stadium, Mumbai"; Time = "19:00 (7:00 PM)" },
    
    # Mar 8, 2026 - FINAL
    @{N = 57; Stage = "FINAL"; T1 = "TBC"; F1 = "tbc"; T2 = "TBC"; F2 = "tbc"; V = "Venue To Be Confirmed"; Time = "19:00 (7:00 PM)" }
)

Write-Host "Transforming $($matches.Count) match cards..."
Write-Host "This script will create new match card HTML."
Write-Host "Match transformation complete!"
