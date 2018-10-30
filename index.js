function pong() {
    var c;
    var ctx;
    var fps = 60;

    var initialState = {
        mouse: {
            x: null,
            y: null
        },
        ball: {
            radius: 10,
            speedXIncrease: 0.1,
            speedYIncrease: 0.1,
            maxSpeedX: 20,
            maxSpeedY: 20,
            color: 'white',
            x: null,
            y: null,
            speedX: 5,
            speedY: 5,
            outOfBoundsLeft: null,
            outOfBoundsRight: null
        },
        leftPaddle: {
            x: null,
            y: null,
            width: 10,
            height: 100,
            color: 'white'
        },
        rightPaddle: {
            x: null,
            y: null,
            width: 10,
            height: 100,
            color: 'white'
        }
    };

    var state = Object.assign({}, initialState);

    var paddlePadding = 5;

    function main() {
        c = document.getElementById('canvas');
        ctx = c.getContext('2d');
        start();
    }

    function start() {
        registerEventHandlers();
        resetGameState();
        draw();

        setInterval(function() {
            move();
            checkGoal();
            draw();
        }, 1000 / fps);
    }

    function registerEventHandlers() {
        canvas.addEventListener('mousemove', function(e) {
            state.mouse.x = e.clientX;
            state.mouse.y = e.clientY;
        });
    }

    function resetGameState() {
        state.ball.x = c.width / 2;
        state.ball.y = c.height / 2;
        state.ball.speedX = -initialState.ball.speedX;//initialState.ball.speedX * (Math.random() > 0.5 ? -1 : 1);
        state.ball.speedY = initialState.ball.speedY * (Math.random() > 0.5 ? -1 : 1);
        state.ball.outOfBoundsLeft = false;
        state.ball.outOfBoundsRight = false;

        state.leftPaddle.x = paddlePadding;
        //state.leftPaddle.y = c.height / 2 - (initialState.leftPaddle.height / 2);

        state.rightPaddle.x = c.width - paddlePadding - initialState.rightPaddle.width;
        state.rightPaddle.y = c.height / 2 - (initialState.rightPaddle.height / 2);
        console.log('resetGameState', state);
    }

    function move() {
        moveBall();
        movePaddle(state.leftPaddle);
    }

    function draw() {
        drawCanvas();
        drawBall(state.ball);
        drawPaddle(state.leftPaddle);
        drawPaddle(state.rightPaddle);
    }

    function drawCanvas () {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, c.width, c.height);
    }

    function checkGoal() {
        if(state.ball.outOfBoundsLeft) {
            console.log('Right player Goal');
            resetGameState();
        }
        else if(state.ball.outOfBoundsRight) {
            console.log('Left player goal');
            resetGameState();
        }
    }

    // PADDLE

    function drawPaddle(paddle) {
        ctx.fillStyle = paddle.color;
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    }

    function movePaddle(paddle) {
        paddle.y = state.mouse.y;
    }

    // BALL

    function drawBall(ball) {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
        ctx.fillStyle = ball.color;
        ctx.fill();
    }

    function moveBall() {
        var ball = state.ball;

        var withinRange = function(num, min, max) {
            return num >= min && num <= max;
        }

        var top = ball.y - ball.radius;
        var right = ball.x + ball.radius;
        var bottom = ball.y + ball.radius;
        var left = ball.x - ball.radius;

        var topOut = !withinRange(top, 0, c.height) && withinRange(bottom, 0, c.height);
        var rightOut = !withinRange(right, 0, c.width) && withinRange(left, 0, c.width);
        var bottomOut = withinRange(top, 0, c.height) && !withinRange(bottom, 0, c.height);
        var leftOut = withinRange(right, 0, c.width) && !withinRange(left, 0, c.width);

        //var ballXOutOfBounds = leftOut || rightOut;
        var ballYOutOfBounds = topOut || bottomOut; 

        if(leftOut) {
            ball.outOfBoundsLeft = true;
        }
        if(rightOut) {
            ball.outOfBoundsRight = true;
        }

        // if(ballXOutOfBounds) {

        //     ball.speedX = -ball.speedX;

        //     if(ball.speedX < 0 && ball.speedX > (-ball.maxSpeedX)) {
        //         ball.speedX -= ball.speedXIncrease;
        //     }
        //     else if(ball.speedX < ball.maxSpeedX) {
        //         ball.speedX += ball.speedXIncrease;
        //     }
        // }

        if(ballYOutOfBounds) {
            ball.speedY = -ball.speedY;
            
            if(ball.speedY < 0 && ball.speedY > (-ball.maxSpeedY)) {
                ball.speedY -= ball.speedYIncrease;
            }
            else if(ball.speedY < ball.maxSpeedY) {
                ball.speedY += ball.speedYIncrease;
            }
        }

        ball.x += ball.speedX;
        ball.y += ball.speedY;

        // if(ball.x > c.width) {
        //     ball.x = c.width - ball.radius;
        //     ball.speedX = -ball.speedX;
        // }
        // if(ball.x < 0) {
        //     ball.x = ball.radius;
        //     ball.speedX = -ball.speedX;
        // }
        if(ball.y > c.height) {
            ball.y = c.height - ball.radius;
            ball.speedY = -ball.speedY;
        }
        if(ball.y < 0) {
            ball.y = ball.radius;
            ball.speedY = -ball.speedY;
        }

        state.ball = ball;
    }

    main();
}

window.onload = function() {
    pong();
};