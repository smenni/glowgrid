# Glowgrid

Little visualizations of a variety of info and art to display on my 196 x 128 LED panel that runs a [flaschentaschen](https://github.com/hzeller/flaschen-taschen) server on a Raspberry Pi.

## Usage

This expects a flaschentaschen server running and connected to your LEDs. In my setup on a Raspberry Pi that I connect with VNC to.

```bash
sudo ./ft-server —led-cols=196 —led-rows=64 —led-parallel=2
```

The openai-example expects a .env file with your key.

## Client

After making sure all necessary packages are installed (will need to work on polishing the experience up...).
Start any of the example code with...

```node <name-of-example>.js
```

<img src="https://github.com/smenni/glowgrid/assets/4135284/0a8afe68-51d5-4bff-9a3f-7d6a3dfef4f5" alt="alt text" width="600" >
<img src="https://github.com/smenni/glowgrid/assets/4135284/f377258d-a307-4c2a-ac57-bd6a5f009cf4" alt="alt text" width="600" >
