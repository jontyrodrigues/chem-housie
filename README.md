# chem-housie
<h4> Introduction </h4>
Tambola is a lottery based game played like bingo. Each tambola ticket consists of 15 numbers, the tickets have 3 line each namely top, middle and bottom; each line have 5 numbers. The numbers in a tambola tickets are from 1 to 90. 6 tickets vetically make an complete set of ticket, each complete set of ticket have all the 90 numbers arranged randomly, for the number 1-9 the numbers are arranged in row 1, 11-19 in row two and so on. The numbers are arranged so that there will be only 5 numbers in any row of a ticket and no number from any column will be repeated and there must 15 numbers in each ticket.Each set of ticket contain 9 columns and 18 rows
The elements in the periodic table are arranged acccording to their atomic number, atomic number is given by the number of protons in the atom. In this game each number is replaced by the corrosponding chemical symbol. 

Both pages load `housie-core.js`, so keep the three files in the same folder.

<h4> Housie Ticket Generator </h4>

Every strip of 6 tickets is generated fresh and uses all 90 elements exactly once. Each ticket has 3 rows of 5 and at least one element in every column. Tickets are generated from a **game code**, so the same code always prints the same tickets.

<h5> Usage </h5>

Open `Housie Ticket Generator.html` in a browser and set:

- **Event title**, printed on every ticket
- **Game code**: keep it so you can reprint, or so the caller can check claims. Press New for a fresh set of tickets. Keep it private: anyone who knows it can recreate every ticket
- **Strips** and **Starting at strip**: print strips 1-10 today and 11-20 later with the same code
- **Each cell shows**: symbol only, symbol + atomic number, or symbol + name
- **Printing**: colour by element group, or ink saver (black and white)
- **Cutting guides**: dashed lines around every ticket, running edge to edge so they work with scissors or a paper cutter
- **Ticket label**: number only (default), or number + full code such as `K7Q2-3-5` (game code, strip, ticket) when players should be able to check tickets themselves

Press Print tickets. It prints on A4 with 12 tickets (2 strips) per page, centred with even margins. Choose Save as PDF to share them digitally.

<h4>Chemical Symbol Generator (Caller) </h4>

Open `chemical symbol generator.html`. Calls are saved automatically, so refreshing or closing the page keeps the game.

- **Periodic table board**: called elements light up in their group colour, and the latest call pulses. Switch to **Ticket columns** to see the board laid out like the tickets (1-9, 10-19 ... 80-90). Tiles can show symbols, numbers or names
- **Now calling card** with atomic number, mass, group and a fun clue for every element
- **Slot-machine roll** before each element lands (can be turned off in settings)
- **Voice**: reads each call aloud. Pick the voice and speed, and optionally read the clue too
- **Quiz mode**: the clue is read first, players guess, then the element is revealed after a pause or when you press Reveal
- **Auto-call** every 5-30 seconds
- **Undo / redo** without confirmation pop-ups (a toast lets you take it back)
- **Check claim**: type the ticket number (after adding the game code in Settings) or a full ticket code, and see the ticket with called elements marked, which patterns are complete and on which call (so late claims are easy to spot). Auto-call pauses while you check. The caller only ever shows ticket numbers, so the game code stays hidden on a projector
- **Prizes**: award Early Five, Four Corners, Top / Middle / Bottom Line and Full House, as many tickets as share each one, and keep track of who won what
- Light and dark themes, fullscreen for projectors, works on phones

<h5> Keyboard Shortcut </h5>

Space / p - call next element (or reveal in quiz mode)<br>
o - repeat current call<br>
z - undo<br>
y - redo<br>
a - start / stop auto-call<br>
q - toggle quiz mode<br>
c - check a claim<br>
v - switch board layout<br>
l - cycle tile labels<br>
f - fullscreen<br>
r - reset game<br>
? - show shortcuts

<h5> Version history </h5>

V2 added autosave to localStorage. V3 added undo / redo, text to speech and the number / symbol / name display options. V4 is the redesign above: generated strips with game codes, claim checking, prizes, quiz mode, auto-call and the periodic table board. Games saved by V3 carry over.

<h5> Online </h5>
You can visit

[Number caller](https://jontyrodrigues.github.io/chem-housie) to generate random symbol<br>
[Ticket generator](https://jontyrodrigues.github.io/chem-housie/ticket) to generate ticket
