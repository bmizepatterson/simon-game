Vue.component('game-timer', {

    template: `
        <div>
            <p v-if="this.smallMessage">{{ this.smallMessage }}</p>
            <div class="game-message">{{ this.bigMessage }}{{ this.remaining }}</div>
        </div>
    `,

    data: function() {
        return {
            smallMessage: '',
            bigMessage: '',
            remaining: '',
            interval: null
        }
    },

    created: function() {
        let self = this;

        self.$parent.$on('state-change', function(state) {

            switch (state) {
                case "start":
                    self.smallMessage = self.bigMessage = '';
                    self.stopTimer();

                case "playing-sequence":
                    self.bigMessage = '';
                    self.smallMessage = 'Watch closely!';
                    self.stopTimer();
                    break;

                case "capturing-taps":
                    self.bigMessage = '';
                    self.smallMessage = 'Your turn!';
                    self.startTimer();
                    break;

                case "correct-choice":
                    self.bigMessage = '';
                    self.smallMessage = "That's right!";
                    self.stopTimer();
                    self.startTimer();
                    break;

                case "wrong-choice":
                case "expired":
                    self.smallMessage = '';
                    self.bigMessage = 'Game Over';
                    self.stopTimer();
                    break;

                case "success":
                    self.bigMessage = '';
                    self.smallMessage = 'Great job!';
                    self.stopTimer();
                    break;

                case "high-score":
                    self.bigMessage = 'New high score!';
                    break;

                default:
                    console.log('Game state changed to [' + state + ']');
            }
        });
    },

    methods: {

        startTimer: function() {
            if (this.interval) return;
            this.remaining = 3;
            this.interval = setInterval(this.tick, 1000);
        },

        stopTimer: function() {
            clearInterval(this.interval);
            this.remaining = '';
            this.interval = null;
        },

        tick: function() {
            this.remaining--;
            if (this.remaining === 0) {
                this.$parent.$emit('state-change', 'expired');
                this.stopTimer();
            }
        }
    }
});

new Vue({

    el: '#gameboard',


    data: {
        capturingTaps: false,
        colors: ["red", "yellow", "green", "blue"],
        currentColor: '',
        currentIndex: 0,
        gameInProgress: false,
        gameOver: false,
        playSequenceId: null,
        sequence: [],
        highScore: 0,
        newHighScore: false
    },

    created: function() {
        let self = this;

        let savedHighScore = localStorage.getItem("highScore");
        if (savedHighScore) self.highScore = savedHighScore;

        self.$on('state-change', function(state) {

            switch (state) {
                case "start":
                    self.currentIndex = 0;
                    self.gameInProgress = true;
                    self.gameOver = false;
                    self.newHighScore = false;
                    self.sequence = [];
                    break;

                case "expired":
                case "wrong-choice":
                    self.setHighScore();
                    self.currentIndex = 0;
                    self.gameInProgress = false;
                    self.gameOver = true;
                    self.sequence = [];
                    break;

                case "playing-sequence":
                    self.capturingTaps = false;
                    self.currentIndex = 0;
                    break;

                case "capturing-taps":
                    self.capturingTaps = true;
                    self.currentIndex = 0;
                    break;

                case "correct-choice":
                case "wrong-choice":
                case "success":
                    self.capturingTaps = false;
                    break;

                case "high-score":
                    self.newHighScore = true;
                    break;

                default:
                    console.log('Game state changed to [' + state + ']');
            }
        });
    },

    methods: {
        start: function() {
            this.$emit('state-change', 'start');
            clearInterval(this.playSequenceId);
            this.playSequence();
        },

        addToSequence: function() {
            let random = Math.floor(Math.random() * 4);
            this.sequence.push(this.colors[random]);
        },

        playSequence: function() {
            let self = this;
            this.$emit('state-change', 'playing-sequence');
            self.addToSequence();
            self.currentIndex = 0;
            self.playSequenceId = setInterval(function() {

                if (self.currentIndex < self.sequence.length) {

                    self.currentColor = self.sequence[self.currentIndex];
                    self.currentIndex++;
                    setTimeout(() => { self.currentColor = ''; }, 500);

                } else {

                    self.$emit('state-change', 'capturing-taps');
                    clearInterval(self.playSequenceId);

                }

            }, 1000);
        },

        button: function (color) {
            if (this.gameInProgress && this.capturingTaps) {

                let self = this;

                self.currentColor = color;
                self.capturingTaps = false;

                setTimeout(function() {

                    self.currentColor = '';
                    self.capturingTaps = true;

                }, 500);

                if (color == self.sequence[self.currentIndex]) {

                    if (self.currentIndex == self.sequence.length - 1) {

                        self.$emit('state-change', 'success');
                        setTimeout(self.playSequence, 3000);

                    } else {

                        self.$emit('state-change', 'correct-choice');
                        self.currentIndex++;

                    }

                } else {

                    self.$emit('state-change', 'wrong-choice');

                }
            }
        },

        setHighScore: function() {
            let newScore = this.sequence.length - 1;
            if (newScore > this.highScore) {
                this.highScore = newScore;
                localStorage.setItem('highScore', newScore);
                this.$emit('state-change', 'high-score');
            }
        }

    }
});
