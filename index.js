function pong() {
    var c;
    var ctx;
    var fps = 60;
    var debug = false;

    var ball = {
        radius: 20,
        initialSpeedX: 5,
        initialSpeedY: 5,
        speedXIncrease: 0.5,
        speedYIncrease: 0.0,
        maxSpeedX: 20,
        maxSpeedY: 20,
        color: 'white',
        x: null,
        y: null,
        width: null,
        height: null,
        speedX: null,
        speedY: null
    };

    var paddlePadding = 5;

    var leftPaddle = {
        x: null,
        y: null,
        width: 10,
        height: 100,
        color: 'white'
    };

    var rightPaddle = {
        x: null,
        y: null,
        width: 10,
        height: 100,
        color: 'white'
    };

    function main() {
        c = document.getElementById('canvas');
        ctx = c.getContext('2d');
        start();
    }

    function start() {
        resetGameState();
        draw();

        setInterval(function() {
            move();
            draw();
        }, 1000 / fps);
    }

    function resetGameState() {
        ball.x = c.width / 2;
        ball.y = c.height / 2;
        ball.width = ball.radius * 2;
        ball.height = ball.width;
        ball.speedX = ball.initialSpeedX;
        ball.speedY = ball.initialSpeedY;

        leftPaddle.x = paddlePadding;
        leftPaddle.y = c.height / 2 - (leftPaddle.height / 2);

        rightPaddle.x = c.width - paddlePadding - rightPaddle.width;
        rightPaddle.y = c.height / 2 - (rightPaddle.height / 2);
    }

    function move() {
        moveBall();
    }

    function draw() {
        drawCanvas();
        drawBall();
        drawPaddle(leftPaddle);
        drawPaddle(rightPaddle);
    }

    function drawCanvas () {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, c.width, c.height);
    }

    function drawPaddle(paddle) {
        ctx.fillStyle = paddle.color;
        ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
    }

    function drawBall() {
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.radius, 0, 2 * Math.PI);
        ctx.fillStyle = ball.color;
        ctx.fill();

        if(debug) {
            (function () {
                var size = 1;
                var top = ball.y - ball.radius;
                var left = ball.x - ball.radius;

                ctx.fillStyle = 'red';
                ctx.fillRect(ball.x, top, size, ball.height);
                ctx.fillRect(left, ball.y, ball.width, size);
            })();   
        }
    }

    function moveBall() {
        if(ball.x >= c.width || ball.x <= 0) {
            ball.speedX = -ball.speedX;

            if(ball.speedX < 0 && ball.speedX > (-ball.maxSpeedX)) {
                ball.speedX -= ball.speedXIncrease;
            }
            else if(ball.speedX < ball.maxSpeedX) {
                ball.speedX += ball.speedXIncrease;
            }
        }

        if(ball.y >= c.height || ball.y <= 0) {
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
    }

    main();
}

window.onload = function() {
    pong();
};