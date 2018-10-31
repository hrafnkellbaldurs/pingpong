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
            speedXIncrease: 1,
            speedYIncrease: 1,
            maxSpeedX: 20,
            maxSpeedY: 20,
            color: 'white',
            x: null,
            y: null,
            speedX: 5,
            speedY: 5,
            outOfBoundsLeft: false,
            outOfBoundsRight: false
        },
        leftPaddle: {
            x: null,
            y: null,
            width: 10,
            height: 100,
            color: 'white',
            padding: 5
        },
        rightPaddle: {
            x: null,
            y: null,
            width: 10,
            height: 100,
            color: 'white',
            padding: -5
        }
    };

    function deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    }

    var state = deepClone(initialState);

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
        c.addEventListener('mousemove', function(e) {
            var rect = c.getBoundingClientRect();
            var documentElement = document.documentElement;
            var mouseX = e.clientX - rect.left - documentElement.scrollLeft;
            var mouseY = e.clientY - rect.top - documentElement.scrollTop;
            
            state.mouse.x = mouseX;
            state.mouse.y = mouseY;
        });
    }

    function resetGameState() {
        var oldState = deepClone(state);
        state = deepClone(initialState);

        state.mouse.x = oldState.mouse.x;
        state.mouse.y = oldState.mouse.y;

        state.ball.x = c.width / 2;
        state.ball.y = c.height / 2;
        state.ball.speedX = initialState.ball.speedX * (Math.random() > 0.5 ? -1 : 1);
        state.ball.speedY = initialState.ball.speedY * (Math.random() > 0.5 ? -1 : 1);
        
        state.leftPaddle.x = state.leftPaddle.padding;
        state.leftPaddle.y = getPaddlePositionByMouse(state.leftPaddle, state.mouse);//c.height / 2 - (initialState.leftPaddle.height / 2);

        state.rightPaddle.x = c.width + state.rightPaddle.padding - initialState.rightPaddle.width;
        state.rightPaddle.y = c.height / 2 - (initialState.rightPaddle.height / 2);
    }

    function move() {
        moveBall();
        movePaddle(state.leftPaddle, state.mouse);
        movePaddle(state.rightPaddle, { x: state.mouse.x, y: state.ball.y });
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
            resetGameState();
        }
        else if(state.ball.outOfBoundsRight) {
            resetGameState();
        }
    }

    // PADDLE

    function drawPaddle(paddle) {
        ctx.fillStyle = paddle.color;
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    }

    function getPaddlePositionByMouse(paddle, mouse) {
        return {
            y: mouse.y - (paddle.height / 2),
            x: paddle.x
        };
    }

    function getPaddleBoundingRect(paddle) {
        return {
            top: paddle.y,
            right: paddle.x + paddle.width,
            bottom: paddle.y + paddle.height,
            left: paddle.x
        }
    }

    function movePaddle(paddle, mouse) {
        paddle.y = getPaddlePositionByMouse(paddle, mouse).y;
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

        var ballTop = ball.y - ball.radius;
        var ballRight = ball.x + ball.radius;
        var ballBottom = ball.y + ball.radius;
        var ballLeft = ball.x - ball.radius;

        var ballTopOut = !withinRange(ballTop, 0, c.height) && withinRange(ballBottom, 0, c.height);
        var ballRightOut = !withinRange(ballRight, 0, c.width) && withinRange(ballLeft, 0, c.width);
        var ballBottomOut = withinRange(ballTop, 0, c.height) && !withinRange(ballBottom, 0, c.height);
        var ballLeftOut = withinRange(ballRight, 0, c.width) && !withinRange(ballLeft, 0, c.width);

        //var ballXOutOfBounds = ballLeftOut || ballRightOut;
        var ballYOutOfBounds = ballTopOut || ballBottomOut; 

        if(ballLeftOut) {
            ball.outOfBoundsLeft = true;
        }
        if(ballRightOut) {
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


        // Paddle detection
        var leftPaddle = state.leftPaddle;
        var rightPaddle = state.rightPaddle;
        var leftPaddleRect = getPaddleBoundingRect(leftPaddle);
        var rightPaddleRect = getPaddleBoundingRect(rightPaddle);

        if(ballLeft < leftPaddleRect.right && ballTop > leftPaddleRect.top && ballBottom < leftPaddleRect.bottom) {
            console.log('ball hit');
            ball.speedX = -ball.speedX;
            ball.x = leftPaddleRect.right + ball.radius;
        }

        if(ballRight > rightPaddleRect.left && ballTop > rightPaddleRect.top && ballBottom < rightPaddleRect.bottom) {
            console.log('ball hit');
            ball.speedX = -ball.speedX;
            ball.x = rightPaddleRect.left - ball.radius;
        }

        state.ball = ball;
    }

    main();
}

window.onload = function() {
    pong();
};