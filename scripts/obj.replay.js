/****
REPLAY
****/

/****
TODO:
Every bsnes movie file begins with the following header fields. All numeric fields are unsigned 32-bit integers, stored in little-endian order.

*	magic: identifies this as a bsnes movie file, always set to the bytes ‘BSV1’ (with no NUL terminator).
*	serializerVersion: Identifies the version of the serialisation format used for the save-state in this file. Versions of bsnes that use a higher or lower version of the serialisation format will be unable to read this file, and it usually increments whenever a change is made to the SNES emulation code.
*	cartCRC: The CRC32 of the cartridge that was loaded when this movie began recording. This prevents a movie recorded with one cartridge from accidentally being played back with a different cartridge. I believe this CRC does not include the content of any BS-X storage carts, Sufami Turbo carts, or Gameboy carts loaded alongside the base SNES cart (although it probably should).
*	stateSize: The size in bytes of the save-state data that should be used to initialize bsnes when playing back this movie file.

The header is followed by a bsnes save-state file, whose length is given by the stateSize header field.

After the save-state, the rest of the file is a sequence of little-endian, 16-bit signed integers, representing the state of whatever controllers the save-state mentions were connected to the emulated SNES at the time, in whatever order that version of bsnes happened to ask for them. Specifically, each integer represents the return value of libsnes' snes_input_state callback, so digital inputs will record 0 or 1 while analogue inputs will record a number in the full 16-bit range.
****/
