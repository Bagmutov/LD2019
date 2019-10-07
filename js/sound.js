export class SOUND {
    static init() {
        this.sound["test"] = new Howl({
            src: ['sound.mp3'],
            // autoplay: true,
            loop: false,
            volume: 0.5,
            onend: function () {
                console.log('Finished!');
            }
        });
        this.sound["kPress0"] = new Howl({ src: ['kPress0.mp3'] });
        this.sound["kPress1"] = new Howl({ src: ['kPress1.mp3'] });
        this.sound["wordCreate"] = new Howl({ src: ['wordCreate.mp3'] });
        this.sound["background"] = new Howl({ src: ['background.mp3'] });
    }
    static play(name) {
        if (this.sound[name])
            this.sound[name].play();
    }
}
SOUND.sound = {};
//# sourceMappingURL=sound.js.map