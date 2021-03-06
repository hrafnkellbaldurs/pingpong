function pong() {
    var c;
    var ctx;

    var settings = {
        debug: false,
        fps: 60,
        winningScore: 5,
        ballPauseDuration: 1000,
        font: {
            style: 'normal',
            variant: 'normal',
            weight: 'normal',
            size: 20,
            family: 'PressStart2P',
            color: 'white',
            textAlign: 'center',
            padding: 10,
        }
    };

    var initialState = {
        mouse: {
            x: null,
            y: null
        },
        ball: {
            radius: 10,
            speedXIncrease: 1,
            speedYIncrease: 1,
            maxSpeedX: 40,
            maxSpeedY: 40,
            color: 'white',
            x: null,
            y: null,
            speedX: 5,
            speedY: 5,
            outOfBoundsLeft: false,
            outOfBoundsRight: false
        },
        p1: {
            paddle: {
                x: null,
                y: null,
                width: 10,
                height: 100,
                hitBoxHeightRatio: 0.2,
                color: 'white',
                padding: 5
            },
            isWinner: false
        },
        p2: {
            paddle: {
                x: null,
                y: null,
                width: 10,
                height: 100,
                hitBoxHeightRatio: 0.2,
                color: 'white',
                padding: -5
            },
            isWinner: false
        },
        score: {
            p1: 0,
            p2: 0
        },
        showingWinScreen: false,
        showingWelcomeMessage: false,
        ballPaused: true
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
        state.showingWelcomeMessage = true;
        registerEventHandlers();
        resetGameState();
        draw();

        setInterval(function() {
            move();
            updateScore();
            draw();
        }, 1000 / settings.fps);
    }

    function setFont(font) {
        font = font || {};
        var style = font.style || settings.font.style; 
        var variant = font.variant || settings.font.variant;
        var weight = font.weight || settings.font.weight;
        var size = font.size || settings.font.size;
        var family = font.family || settings.font.family;
        var color = font.color || settings.font.color;
        var textAlign = font.textAlign || settings.font.textAlign;

        ctx.fillStyle = color;
        ctx.textAlign = textAlign;
        ctx.font = [style, variant, weight, size + 'px', family].join(' ');
    }

    function registerEventHandlers() {
        
        // Resize
        window.addEventListener('resize', onWindowResize);
        onWindowResize();

        // Mouse/touch input
        c.addEventListener('mousemove', function(e) {
            onMouseMove(e.clientX, e.clientY);
        });
        c.addEventListener('touchmove', onTouch);

        // Click/tap input
        c.addEventListener('click', onClick);
        c.addEventListener('touchstart', function(e) {
            onTouch(e);
            onClick();
        });

        function onWindowResize() {
            c.width = document.body.clientWidth;
            c.height = document.body.clientHeight;
            resetGameState();
        }

        function onTouch(e) {
            var touch = e.touches[0];
            onMouseMove(touch.clientX, touch.clientY);
            e.preventDefault();
        }

        function onMouseMove(x, y) {
            var rect = c.getBoundingClientRect();
            var documentElement = document.documentElement;
            var mouseX = x - rect.left - documentElement.scrollLeft;
            var mouseY = y - rect.top - documentElement.scrollTop;
            
            state.mouse.x = mouseX;
            state.mouse.y = mouseY;
        }

        function onClick(e) {
            if(state.showingWinScreen || state.showingWelcomeMessage) {
                restartGame();
            }
        }
    }

    function resetBall() {
        var ball = deepClone(initialState.ball);
        
        ball.x = c.width / 2;
        ball.y = c.height / 2;
        ball.speedX *= Math.random() > 0.5 ? -1 : 1;
        ball.speedY *= Math.random() > 0.5 ? -1 : 1;

        if(settings.debug) {
            ball.speedX = -5
            ball.speedY = 0;
        }

        // Pause ball 
        state.ballPaused = true;
        setTimeout(function() { 
            state.ballPaused = false;
        }, settings.ballPauseDuration);

        state.ball = ball;
    }

    function restartGame() {
        resetGameState();
        state.p1.isWinner = false;
        state.p2.isWinner = false;
        state.score = deepClone(initialState.score);
        state.showingWinScreen = false;
        state.showingWelcomeMessage = false;
    }

    function resetMouse(oldMouse) {
        state.mouse.x = oldMouse.x;
        state.mouse.y = oldMouse.y;
    }

    function resetPaddles(oldState) {
        state.p1.paddle.x = oldState.p1.paddle.padding;
        state.p1.paddle.y = getPaddlePositionByMouse(oldState.p1.paddle, oldState.mouse);

        state.p2.paddle.x = c.width + oldState.p2.paddle.padding - initialState.p2.paddle.width;
        state.p2.paddle.y = c.height / 2 - (initialState.p2.paddle.height / 2);
    }

    function resetGameState() {
        var oldState = deepClone(state);
        state = deepClone(initialState);

        resetMouse(oldState.mouse);
        resetBall();
        resetPaddles(oldState);

        state.score = oldState.score;
        state.p1.isWinner = oldState.p1.isWinner;
        state.p2.isWinner = oldState.p2.isWinner;
        state.showingWinScreen = oldState.showingWinScreen;
        state.showingWelcomeMessage = oldState.showingWelcomeMessage;
    }

    function move() {
        if(!state.showingWinScreen) {
            if(!state.ballPaused) {
                moveBall();
            }
            movePaddle(state.p1.paddle, state.mouse);
            getComputerMovement(state.p2.paddle, state.ball);
        }
    }

    function draw() {
        drawCanvas();

        if(state.showingWelcomeMessage) {
            drawWelcomeMessage();
        }
        else if(state.showingWinScreen) {
            drawWinner();
        }
        else {
            drawNet();
            drawBall(state.ball);
            drawPaddle(state.p1.paddle);
            drawPaddle(state.p2.paddle);
            drawScore(state.score);
        }       
    }

    function drawCanvas() {
        ctx.fillStyle = 'black';
        ctx.fillRect(0, 0, c.width, c.height);
    }

    function drawWelcomeMessage() {
        var messages = [
            'Welcome to Ping Pong', 
            'First player that gets ' + settings.winningScore + ' points wins',
            'Click to start'
        ];
        var fontSize = settings.font.size;
        var padding = settings.font.padding;

        var startY = (c.height / 2) - ((messages.length * (fontSize + padding)) / 2);
        var x = c.width / 2;
        
        setFont();

        messages.forEach(function(message) {
            ctx.fillText(message, x, startY, c.width);
            startY += fontSize + padding;
        });
    }

    function drawNet() {
        var dashHeight = 10;
        var dashWidth = 2;
        var dashDistance = 15;
        var color = 'white';
        var canvasXCenter = c.width / 2;
        
        if(!ctx.setLineDash) {
            lineDashPolyFill(dashHeight, dashDistance, dashWidth, color);
        }
        else {
            ctx.setLineDash([dashHeight, dashDistance]);
            ctx.strokeStyle = color;
            ctx.lineWidth = dashWidth;
            ctx.beginPath();
            ctx.moveTo(canvasXCenter, dashHeight / 2);
            ctx.lineTo(canvasXCenter, c.height);
            ctx.stroke();
        }

        function lineDashPolyFill(dashHeight, dashDistance, dashWidth, color) {
            var amount = c.height / (dashHeight + dashDistance);
            var canvasXCenter = c.width / 2;
            var dashStart;
            var dashEnd;

            ctx.strokeStyle = color;
            ctx.lineWidth = dashWidth;

            for (var i = 0; i < amount; i++) {
                dashStart = i * (dashHeight + dashDistance);
                dashEnd = dashStart + dashHeight;

                ctx.moveTo(canvasXCenter, dashStart);
                ctx.lineTo(canvasXCenter, dashEnd);
                ctx.stroke();
            };
        }
    }

    function drawScore(score) {
        setFont({ size: 20 });
        ctx.fillText(score.p1 + '       ' + score.p2, c.width / 2, 40);
    }

    function drawWinner() {
        var message;

        if(state.p1.isWinner) {
            message = 'Player won with ' + state.score.p1 + ' points.';
        }
        if(state.p2.isWinner) {
            message = 'Computer won with ' + state.score.p2 + ' points.';
        }

        if(message) {
            setFont();
            ctx.fillText(message, c.width / 2, c.height / 2, c.width);
            ctx.fillText('Click to play again', c.width / 2, (c.height / 2) + settings.font.size + settings.font.padding, c.width);
        }
    }

    function updateScore() {
        var score = getScoreState();
        var scoreChanged = score.p1 !== state.score.p1 || score.p2 !== state.score.p2;

        if(scoreChanged) {
            state.score = score;

            state.p1.isWinner = score.p1 >= settings.winningScore;
            state.p2.isWinner = score.p2 >= settings.winningScore;
            
            state.showingWinScreen = state.p1.isWinner === true || state.p2.isWinner === true;

            resetGameState();
        }
    }

    function getScoreState() {
        var score = deepClone(state.score);
        
        if(state.ball.outOfBoundsLeft) {
            score.p2++;
        }
        else if(state.ball.outOfBoundsRight) {
            score.p1++;
        }

        return score;
    }

    // PADDLE
    function getComputerMovement(paddle, ball) {
        var paddleCenter = paddle.y + (paddle.height / 2);
        var awarenessRange = paddle.height / 3;
        var moveAmount = 10;
        if(paddleCenter < ball.y - awarenessRange) {
            paddle.y += moveAmount;
        }
        else if(paddleCenter > ball.y + awarenessRange){
            paddle.y -= moveAmount;
        }
    }

    function drawPaddle(paddle) {
        if(settings.debug) {
            ctx.fillStyle = 'rgba(255,0,0,0.5)';
            ctx.fillRect(
                paddle.x, 
                paddle.y - (paddle.height * paddle.hitBoxHeightRatio), 
                paddle.width, 
                paddle.height + (paddle.height * paddle.hitBoxHeightRatio * 2)
            );
        }

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
        var paddleRect;
        
        paddle.y = getPaddlePositionByMouse(paddle, mouse).y;
        
        paddleRect = getPaddleBoundingRect(paddle);

        if(paddleRect.top < 0) {
            paddle.y = 0;
        }
        else if(paddleRect.bottom > c.height) {
            paddle.y = c.height - paddle.height;
        }
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

        var ballYOutOfBounds = ballTopOut || ballBottomOut; 

        if(ballLeftOut) {
            ball.outOfBoundsLeft = true;
        }
        if(ballRightOut) {
            ball.outOfBoundsRight = true;
        }

        if(ballTopOut) {
            ball.y = ball.radius;
        }
        else if(ballBottomOut) {
            ball.y = c.height - ball.radius;
        }

        if(ballYOutOfBounds) {
            ball.speedY = -ball.speedY;
        }

        
        if(ball.y > c.height) {
            ball.y = c.height - ball.radius;
            ball.speedY = -ball.speedY;
        }
        if(ball.y < 0) {
            ball.y = ball.radius;
            ball.speedY = -ball.speedY;
        }


        // Paddle detection
        var p1Paddle = state.p1.paddle;
        var p2Paddle = state.p2.paddle;
        var p1PaddleRect = getPaddleBoundingRect(p1Paddle);
        var p1PaddleHitBoxHeight = p1Paddle.height * p1Paddle.hitBoxHeightRatio;
        var p2PaddleRect = getPaddleBoundingRect(p2Paddle);
        var ballHitP1Paddle;
        var ballHitP2Paddle;
        
        var onBallHitPaddle = function(paddle, paddleEdge, offset) {
            var deltaY = ball.y - (paddle.y + (paddle.height / 2));
            ball.speedY = deltaY * 0.4;

            if(ball.speedY > ball.maxSpeedY) {
                ball.speedY = ball.maxSpeedY;
            }

            ball.speedX = -ball.speedX;
            // Make sure the ball is outside the paddle edge
            ball.x = paddleEdge + offset;
        };
        
        // Set hitbox height
        p1PaddleRect.top -= p1PaddleHitBoxHeight;
        p1PaddleRect.bottom += p1PaddleHitBoxHeight;

        ballHitP1Paddle = ballLeft < p1PaddleRect.right && ballTop > p1PaddleRect.top && ballBottom < p1PaddleRect.bottom;
        ballHitP2Paddle = ballRight > p2PaddleRect.left && ballTop > p2PaddleRect.top && ballBottom < p2PaddleRect.bottom;
        

        if(ballHitP1Paddle) {
            onBallHitPaddle(p1Paddle, p1PaddleRect.right, ball.radius);
        }
        else if(ballHitP2Paddle) {
            onBallHitPaddle(p2Paddle, p2PaddleRect.left, -ball.radius);
        }

        ball.x += ball.speedX;
        ball.y += ball.speedY;

        state.ball = ball;
    }

    main();
}

window.onload = function() {
    pong();
};