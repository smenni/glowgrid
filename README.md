# Glowgrid

Little visualizations of a variety of info and art to display on my 196 x 128 LED panel that runs a [flaschentaschen](https://github.com/hzeller/flaschen-taschen) server on a Raspberry Pi.

## Usage

This expects a flaschentaschen server running and connected to your LEDs. In my setup on a Raspberry Pi that I connect with VNC to.

```bash
sudo ./ft-server —led-cols=196 —led-rows=64 —led-parallel=2
```

## Clients

After making sure all necessary packages are installed (will need to work on polishing the experience up...).
Start any of the example code with...

```node <name-of-example>.js
```