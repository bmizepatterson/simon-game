Vue.component('game-timer', {

    template: '<div class="game-message">{{ this.message }}{{ this.timer }}</div>',

    data: function() {
        return {
            message: '',
            timer: ''
        }
    }
});

new Vue({

    el: '#gameboard',


    data: {
        colors: ["red", "yellow", "green", "blue"],
        currentColor: '',
        sequence: [],
        currentIndex: 0,


        gameInProgress: false,
        computerInterval: null,

        gameLost: false,
        timer: null,
        displayTimer: 3,
        timerActive: false,
        playerTurn: false
    },

    methods: {
        start: function() {

            clearInterval(this.timer);
            clearInterval(this.computerInterval);
            this.gameInProgress = true;
            this.displayTimer = 3;
            this.sequence = [];
            this.gameLost = false;
            this.playSequence();

        },

        playSequence: function() {
            let self = this;

            self.currentIndex = 0;
            self.addToSequence();

            self.computerInterval = setInterval(function() {

                if (self.currentIndex < self.sequence.length) {

                    self.currentColor = self.sequence[self.currentIndex];
                    self.currentIndex++;

                    setTimeout(() => { self.currentColor = ''; }, 500);

                } else {

                    self.playerTurn = true;
                    self.currentIndex = 0;
                    self.startCountdown();
                    clearInterval(self.computerInterval);

                }
            }, 1000);

        },

        startCountdown: function () {
            let self = this;

            self.timerActive = true;
            self.displayTimer = 3;

            self.timer = setInterval(function() {
                if (self.displayTimer > 1){

                    self.displayTimer -= 1

                } else {
                    self.timerActive = false;
                    clearInterval(self.timer);
                    self.gameOver();
                }
            }, 1000);

        },

        gameOver: function() {

            this.gameLost = true;
            this.gameInProgress = false;
            this.currentIndex = 0;
            this.sequence = [];

        },

        button: function (color) {
            if (!this.gameInProgress || !this.playerTurn) return;

            let self = this;
            self.timerActive = false;

            clearInterval(self.timer);

            self.currentColor = color;
            self.playerTurn = false;

            setTimeout(function() {

                self.currentColor = '';
                self.playerTurn = true;

                if (color == self.sequence[self.currentIndex]) {

                    if (self.currentIndex == self.sequence.length - 1) {
                        self.playerTurn = false;
                        self.playSequence();

                    } else {
                        self.startCountdown();
                        self.currentIndex++;

                    }

                } else {
                    self.gameOver();

                }

            }, 500);

        },

        addToSequence: function() {
            let random = Math.floor(Math.random() * 4);
            this.sequence.push(this.colors[random]);
        }
    }
});
