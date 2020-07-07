const AgoraRTC = require('./AgoraRTCSDK-3.1.1')
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

const remoteContainer = new JSDOM(`<body><script>document.getElementById('remote-container');</script></body>`)
const canvasContainer = new JSDOM(`<body><script>document.getElementById('canvas-container');</script></body>`)

// join stream
module.exports = function addVideoStream(streamId) {
    const streamDiv = document.createElement('div')
    streamDiv.id = streamId
    remoteContainer.appendChild(streamDiv)
}
// remove stream
module.exports = function removeVideoStream(event) {
    const stream = event.stream;
    stream.stop();
    const remDiv = document.getElementById(stream.getId())
    remDiv.parentNode.removeChild(remDiv)
    console.log("Remote Stream is removed" + stream.getId())
}
//canvas stream
module.exports = function addCanvas(streamId) {
    const video = document.getElementById(`video${streamId}`);
    const canvas = document.createElement('canvas')
    canvasContainer.appendChild(canvas);
    const ctx = canvas.getContext('2d')

    video.addEventListener('loadedmetadata', () => {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
    });

    video.addEventListener('Play', () => {
        const $this = this
            (function loop() {
                if (!$this.paused && !$this.ended) {
                    if ($this.windows !== canvas.width) {
                        canvas.width = $this.videoWidth;
                        canvas.height = $this.videoHeight
                    }
                    ctx.drawImage($this, 0, 0);
                    setTimeout(loop, 1000 / 30)
                }
            })();
    }, 0)
}

const client = AgoraRTC.createClient({
    mode: 'live',
    codec: 'h264'
});

client.init("9134599c186641cf82c8086b514b50a8", () => console.log("Client Initialize"))

client.join(null, 'applyhigh-video-call', null, (uid) => {
    const localStream = AgoraRTC.createStream({
        streamId: uid,
        audio: true,
        video: true,
        screen: false
    })
    localStream.init(() => {
        localStream.play('my-feed')
        client.publish(localStream)
        client.on("Stream added", (event) => {
            client.subscribe(event.stream)
        })
        client.on("stream-subscribed", () => {
            const stream = event.stream
            addVideoStream(stream.getId())
            stream.play(stream.getId())
            addCanvas(stream.getId())
        })
        client.on("stream removed", removeVideoStream)
    })
})