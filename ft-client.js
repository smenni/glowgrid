const dgram = require('dgram');

class ftClient {
    constructor(context, host, port, ledWidth, ledHeight) {
        this.context = context;
        this.HOSTNAME = host;
        this.PORT = port;
        this.LED_WIDTH = ledWidth;
        this.LED_HEIGHT = ledHeight;
        this.ftArray = new Uint8Array(this.LED_WIDTH * this.LED_HEIGHT * 3);
        this.packets = [];

        // Initialize the UDP client
        this.client = dgram.createSocket('udp4');

        // Attach event listeners
        this.initializeClientEvents();
    }

    initializeClientEvents() {
        this.client.on('message', (message, info) => {
            console.log('Address: ', info.address, 'Port: ', info.port, 'Size: ', info.size);
            console.log('Message from server', message.toString());
        });
    }

    copyToBuffer(context) {
        // Copy canvas data into buffer
        for (let y = 0; y < this.LED_HEIGHT; y++) { // Each row of the LED matrix
            for (let x = 0; x < this.LED_WIDTH; x++) { // Each column of the LED matrix
                let pixelPosition = (x + y * this.LED_WIDTH) * 3;
                let imgData = context.getImageData(x, y, 1, 1).data

                this.ftArray[pixelPosition] = imgData[0];
                this.ftArray[pixelPosition + 1] = imgData[1];
                this.ftArray[pixelPosition + 2] = imgData[2];
            }
        }

        this.sendAllPackets();
    }

    organizeAndPreparePackets() {
        const MAX_PACKET_SIZE = 9000;
        const MAX_ROWS_PER_PACKET = 15;
        const payloadSize = this.LED_WIDTH * this.LED_HEIGHT * 3;
        let numPackages = Math.ceil(payloadSize / MAX_PACKET_SIZE);
        let numRowsToSend = Math.ceil(this.LED_HEIGHT / numPackages);
        let rowOffset = numRowsToSend * 3 * this.LED_WIDTH;

        // Using an array instead of individual buffers
        let buffers = [];
        let headers = [];

        for (let i = 0; i < numPackages; i++) {
            let start = i * rowOffset;
            let end = (i === numPackages - 1) ? this.ftArray.length : start + rowOffset;
            buffers[i] = Buffer.from(this.ftArray.slice(start, end));

            // Construct headers
            let yOffset = i * MAX_ROWS_PER_PACKET;
            let rowsInThisPacket = (i === numPackages - 1) ? (128 % MAX_ROWS_PER_PACKET) : MAX_ROWS_PER_PACKET;
            headers[i] = Buffer.from(`P6\n196 ${rowsInThisPacket}\n#FT: 0 ${yOffset} 5\n255\n`);

            // Add to packets
            this.packets.push(Buffer.concat([headers[i], buffers[i]]));
        }
    }

    sendAllPackets() {
        this.organizeAndPreparePackets()

        for (let packet of this.packets) {
            this.send(packet);
        }
        // Clear the packets array after sending
        this.packets = [];
    }

    send(packet) {
        this.client.send(packet, this.PORT, this.HOSTNAME, (err) => {
            if (err) {
                console.error('Failed to send packet !!' + err);
            } else {
                console.log('Packet sent successfully !!');
            }
        });
    }
}

module.exports = ftClient;


// Usage:
// const clientInstance = new LEDClient(context, '127.0.0.1', 12345, LED_WIDTH, LED_HEIGHT);
// clientInstance.copyToBuffer();
