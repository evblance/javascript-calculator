/*

  // TODO: track if replay button was engaged, to be able to scroll the working buffer
     after a calculationn. Engages if replay button pressed. The state resets after every calculation so that the normal
     function of pressing an operator after a calcualtion will insert the last answer
     into the working buffer


 - TODO: add replay buttons to allow the use to scroll around the buffer
   and insert entries wherever they choose.
 - User enters values that gro strait into the upper buffer
 - if special functions or shifted functions are used these are replaced in this
 - Once the user selects an operator
 - When the '=' is pressed, compute what is in the buffer. If the buffer
   has not been refreshed it should not be reset. In other words, any key
   except for '=' needs to reset the buffer.
 - Using an operator (+,-,*,/) directly after a calculation should make
  the buffer reset with 'Ans' and then the operator.


 - When the calculation is computed, join the buffer into a string to be
   parsed by the computeExpression function, which may be used recursively
   for purposes of dealing with parentheses, therefore it should take
   the buffer as its only parameter.


 - Keys that require special handling: SHIFT, M, %, Exp,


 - compute: if compute triggered but


*/
var F_FIX = 1000;  // fix for float issues on add and subtract
var BUFFER_LIMIT = 40;
var $controls = $('.controls-table');
var $display = $('#display');
var $workingBuffer = $('#buffer');
var $bufferCaret = $('#buffer-caret');

var Calc = {
  on: false,
  scienceOn: false,
  bufferAtLimit: false,
  computeBuffer: [],
  workingBuffer: [],
  displayBuffer: [],
  lastAnswer: 0,
  answerStored: false,
  memoryValue: undefined,
  replayEngaged: false,
  // tracks SHIFT key state
  shiftKeyPressed: false,
  // tracks state of negation (-) <num>
  negationActive: false,
  // tracks state of sin, cos, tan, sqrt, ln and log use
  specialInputActive: false,

  powerOn: function() {
    Calc.on = true;
    Calc.caretShown = true;
  },

  powerOff: function() {
    Calc.on = false;
    Calc.caretShown = false;
  },

  isPoweredOn: function() {
    return Calc.on;
  },

  engageReplayMode: function() {
    Calc.replayEngaged = true;
  },

  disengageReplayMode: function() {
    Calc.replayEngaged = true;
  },

  wBufferIsMaxed: function() {
    return (Calc.workingBuffer.length >= BUFFER_LIMIT);
  },

  renderDisplayBuffer: function() {
    $display.text(Calc.displayBuffer);
  },

  getRenderedDisplayContent: function() {
    return $display.text();
  },

  resetBufferIndex: function() {
    Calc.bufferIndex = 1;
  },

  incrementBufferIndex: function() {
    // do not allow overflow of insertion index
    if (Calc.bufferIndex + 1 > Calc.workingBuffer.length-1) {
      return;
    }
    Calc.bufferIndex++;
  },

  decrementBufferIndex: function() {
    // do not allow overflow of insertion index
    if (Calc.bufferIndex - 1 < 0) {
      return;
    }
    Calc.bufferIndex--;
  },

  // refreshDisplay: function() {
  //   // function to show the contents of the displayBuffer property.
  //   var msg;
  //   // somehow deal with output that would overflow the display range
  //   // could also do this with an inputAllowed Boolean variable ie.
  //   // if there is no space left, do not allow further digit input.
  //   if ((Calc.isSci && Calc.displayBuffer.length >= 18) || (!Calc.isSci && Calc.displayBuffer.length >= 14)) {
  //     msg = "too long...";
  //     Calc.renderToDisplay(displayed);
  //     return;
  //   }
  //   msg = Calc.displayBuffer.join('');
  //   Calc.renderToDisplay(msg);
  // },

  resetDisplayBuffer: function() {
    Calc.displayBuffer = [];
  },

  zeroDisplayBuffer: function() {
    Calc.displayBuffer = [0];
  },

  resetComputeBuffer: function() {
    Calc.computeBuffer = [0];
  },

  setLastAnswer: function(result) {
    Calc.lastAnswer = result;
  },

  getLastAnswer: function() {
    return this.lastAnswer;
  },

  lastEntryIsOperand: function() {
    var lastEntry = Calc.computeBuffer[Calc.computeBuffer.length-1];
    return (lastEntry === '+' || lastEntry === '-' || lastEntry === 'x' || lastEntry === "/") ? 1 : 0;
  },

  highlightKey: function($key) {
    $key.addClass('button-activated');
  },

  unhighlightKey: function($key) {
    $key.removeClass('button-activated');
  },

  activateNegation: function() {
    Calc.negationActive = true;
    Calc.highlightKey($('#key-subtract'));
  },

  deactivateNegation: function() {
    Calc.negationActive = false;
    Calc.unhighlightKey($('#key-subtract'));
  },

  activateShiftKey: function() {
    Calc.shiftKeyPressed = true;
    Calc.highlightKey($('#key-shift'));
  },

  deactivateShiftKey: function() {
    Calc.shiftKeyPressed = false;
    Calc.unhighlightKey($('#key-shift'));
  },

  activatePercentageKey: function() {
    Calc.highlightKey($('#key-percent'));
  },

  deactivatePercentageKey: function() {
    Calc.unhighlightKey($('#key-percent'));
  },

  activateMemKey: function() {
    Calc.highlightKey($('#key-mem'));
  },

  deactivateMemKey: function() {
    Calc.memoryValue = undefined;
    Calc.unhighlightKey($('#key-mem'));
  },

  makePowerOfTen: function() {
    var val = Calc.readoutDisplay.length - 3 * Math.pow(10, Calc.readoutDisplay.length - 1);
    Calc.readoutDisplay.splice(Calc.readoutDisplay.length - 3, 3, val);
  },

  // pushComputeBuffer: function() {
  //   Calc.displayBuffer = Calc.computeBuffer.join('');
  // },

  pushComputeResult: function() {
    Calc.displayBuffer = Calc.lastAnswer;
  },

  pushWorkingBuffer: function() {
    Calc.computeBuffer = Calc.workingBuffer;
  },

  resetWorkingBuffer: function() {
    Calc.workingBuffer = [];
  },

  eraseWorkingBuffer: function() {
    $workingBuffer.text('');
  },

  renderWorkingBuffer: function() {
    $workingBuffer.text(Calc.workingBuffer.join(''));
  },

  isOperator: function(val) {
    switch(val) {
      case '+':
      case '-':
      case 'x':
      case '/':
      case 'sin':
      case 'cos':
      case 'tan':
      case '%':
      case 'sqrt':
        return true;
      default:
        return false;
    }
  },

  isHPOperator: function(val) {
    return ( val === 'x' || val === '/' );
  },

  isLPOperator: function(val) {
    return ( val === '+' || val === '-' );
  },

  isSpecialOperator: function(val) {
    switch(val) {
      case 'sin':
      case 'cos':
      case 'tan':
      case 'sqrt':
        return true;
      default:
        return false;
    }
  },

  makeScientific: function() {
    if (!Calc.scienceOn) {
      $controls.addClass('scientific-ui');
      $('#display-area').addClass('scientific-display');
      $controls.find('tr:nth-child(1)').prepend('<td><div id="key-rpar" class="button button-mod">)</div></td>');
      $controls.find('tr:nth-child(1)').prepend('<td><div id="key-lpar" class="button button-mod">(</div></td>');
      $controls.find('tr:nth-child(2)').prepend('<td><div id="key-sqrt" class="button button-mod">√</div></td>');
      $controls.find('tr:nth-child(2)').prepend('<td><div id="key-sin" class="button button-mod button-cramped">sin</div></td>');
      $controls.find('tr:nth-child(3)').prepend('<td><div id="key-pi" class="button button-mod">π</div></td>');
      $controls.find('tr:nth-child(3)').prepend('<td><div id="key-cos" class="button button-mod button-cramped">cos</div></td>');
      $controls.find('tr:nth-child(4)').prepend('<td><div id="key-ln" class="button button-mod">ln</div></td>');
      $controls.find('tr:nth-child(4)').prepend('<td><div id="key-tan" class="button button-mod button-cramped">tan</div></td>');
      $controls.find('tr:nth-child(5)').prepend('<td><div id="key-log" class="button button-mod button-cramped">log</div></td>');
      $controls.find('tr:nth-child(5)').prepend('<td><div id="key-factorial" class="button button-mod"><span>x!</span></div></td>');
      $controls.find('tr:nth-child(6)').prepend('<td><div id="key-inv" class="button button-mod button-cramped"><span>1/x</span></div></td>');
      $controls.find('tr:nth-child(6)').prepend('<td><div id="key-pow" class="button button-mod"><span>x<sup>y</sup></span></div></td>');
      Calc.scienceOn = true;
      Calc.resetWorkingBuffer();
    }
  },

  makeUnscientific: function() {
    if (Calc.scienceOn) {
      $controls.find('tr td:first-child').remove();
      $controls.find('tr td:first-child').remove();
      $('#display-area').removeClass('scientific-display');
      Calc.scienceOn = false;
      Calc.resetWorkingBuffer();
    }
  },

  interpretKeypress: function(buttonID) {
    switch(buttonID) {
      case 'key-1':
        return 1;
      case 'key-2':
        return 2;
      case 'key-3':
        return 3;
      case 'key-4':
        return 4;
      case 'key-5':
        return 5;
      case 'key-6':
        return 6;
      case 'key-7':
        return 7;
      case 'key-8':
        return 8;
      case 'key-9':
        return 9;
      case 'key-0':
        return 0;
      case 'key-period':
        return '.';
      case 'key-compute':
        return '=';
      case 'key-add':
        return '+';
      case 'key-subtract':
        return "-";
      case 'key-multiply':
        return "x";
      case 'key-divide':
        return "/";
      case 'key-shift':
        return 'SHIFT';
      case 'key-mem':
        return 'M';
      case 'key-percent':
        return '%';
      case 'key-exp':
        return 'Exp';
      case 'key-lpar':
        return '(';
      case 'key-rpar':
        return ')';
      case 'key-inv':
        return 'Inv';
      case 'key-sin':
        return 'sin';
      case 'key-cos':
        return 'cos';
      case 'key-tan':
        return 'tan';
      case 'key-ln':
        return 'ln';
      case 'key-log':
        return 'log';
      case 'key-factorial':
        return '!';
      case 'key-sqrt':
        return 'sqrt';
      case 'key-pow':
        return 'pow';
      case 'key-pi':
        return 'PI';
      case 'key-del':
        return 'DEL';
      case 'key-ac':
        return 'AC';
      case 'key-answer':
        return 'Ans';
      case 'replay-left':
        return 'REPLAY-L';
      case 'replay-right':
        return 'REPLAY-R';
    }
  },

  respondToInput: function(input) {

    function calculationLegal() {
      var wBStr = Calc.workingBuffer.join('');

      // check user has closed all parentheses
      var lPar = 0, rPar = 0;
      for (var i = 0; i < wBStr.ength; i++) {
        switch(wBStr[i]) {
          case '(':
            lPar++;
            break;
          case ')':
            rPar++;
            break;
        }
      }
      if (lPar !== rPar) {
        alert('You need to a close a pair(s) of parentheses!')
        return false;
      }

      // check user is not trying to divide by zero
      for (var i = 1; i < wBStr.length; i++) {
        if ( ( wBStr[i] === '0' ) && ( wBStr[i-1] === "/" ) ) {
          alert('Error: Division by 0');
          return false;
        }
      }

      //check if last entry is an operator
      if ( Calc.isOperator(wBStr[wBStr.length-1]) ) {
        return false;
      }

      return true;
    }


    //  // start a new calculation after user gives input following a computation
    // if ( Calc.workingBuffer[Calc.workingBuffer.length-1] === "=") {
    //   Calc.resetDisplayBuffer();
    //   Calc.resetComputeBuffer();
    // } else if ( Calc.workingBuffer[ Calc.workingBuffer.length-1] === "E") {
    //   Calc.resetDisplayBuffer();
    // }
    // first input should occur only when calculator is on or being turned on
    if (!Calc.isPoweredOn() && input !== 'AC') {
      return;
    }

    // do not allow further data input if working buffer is maxed
    if ( Calc.wBufferIsMaxed() && (input !== 'AC' && input !== 'DEL' ) ) {
      console.log('The working buffer is maxed...');
      return;
    }

    // process input
    switch(input) {

      case 'AC':
        Calc.powerOn();
        Calc.resetBufferIndex();
        Calc.resetWorkingBuffer();
        Calc.eraseWorkingBuffer();
        Calc.zeroDisplayBuffer();
        Calc.renderDisplayBuffer();
      break;

      case 'DEL':
        // check that the user isn't attempting to clear the memory
        if (Calc.shiftKeyPressed) {
          // clear the memory
          Calc.deactivateMemKey();
          Calc.deactivateShiftKey();
        } else {
          if ( Calc.workingBuffer.length === 0) {
            Calc.zeroDisplayBuffer();
            Calc.renderDisplayBuffer();
          }
          Calc.decrementBufferIndex();
          Calc.workingBuffer.pop();

          // make sure that we will be able to erase single digits
          var strDBuffer =  Calc.displayBuffer.toString();
          var strDBufferLen = strDBuffer.length;
          Calc.resetDisplayBuffer();
          for ( var i = 0; i < strDBufferLen; i += 2 ) {
             Calc.displayBuffer.push(strDBuffer[i]);
          }
          // delete digits on display as desired up to last one
          if (  Calc.displayBuffer.length > 1 ) {
             Calc.displayBuffer.pop();
          } else {
            /*
             * either a result was just displayed or we are
             * deleting the leading 0 from display
             */
            Calc.zeroDisplayBuffer();
          }
          Calc.renderWorkingBuffer();
        }
        console.log(Calc.bufferIndex);
        break;

      case 'REPLAY-L':
        Calc.engageReplayMode();
        Calc.decrementBufferIndex();
        console.log(Calc.bufferIndex);
        break;
      case 'REPLAY-R':
        Calc.engageReplayMode();
        Calc.incrementBufferIndex();
        console.log(Calc.bufferIndex);
        break;

      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
      case 9:
      case 0:
      case '.':
      case '(':
      case ')':
      case 'PI':
      case 'sin':
      case 'cos':
      case 'tan':
      case 'sqrt':
      case 'ln':
      case 'log':
      case '!':
      case 'E':
        if (Calc.negationActive) {
           Calc.workingBuffer.splice(Calc.bufferIndex+1,1,'(-' + input + ')');
          Calc.deactivateNegation();
        } else {
           Calc.workingBuffer.splice(Calc.bufferIndex+1,1,input);
        }
        console.log(Calc.bufferIndex);
        if ( ( Calc.bufferIndex ) > 1 && Calc.isSpecialOperator(input) ) {
          Calc.workingBuffer.splice(Calc.bufferIndex,0,'x');
          Calc.incrementBufferIndex();
        }
        Calc.incrementBufferIndex();
        console.log(Calc.bufferIndex);
        Calc.renderWorkingBuffer();
        console.log(Calc.workingBuffer);
        break;

      case '-':
        // if shift is pressed, user is engaging negation mode
        if (Calc.shiftKeyPressed) {
          Calc.activateNegation();
          Calc.deactivateShiftKey();
          break;
        } else if (Calc.lastAnswer &&  Calc.workingBuffer.length === 0) {
          Calc.resetWorkingBuffer();
          Calc.workingBuffer.push(Calc.lastAnswer);
          Calc.incrementBufferIndex();
        }
        Calc.workingBuffer.splice(Calc.bufferIndex+1,1,input);
        Calc.incrementBufferIndex();
        Calc.renderWorkingBuffer();
        break;

      case '+':
      case 'x':
      case '/':
        // do not allow stacking of operators
        if ( Calc.workingBuffer[ Calc.workingBuffer.length-1] === '' || Calc.isOperator( Calc.workingBuffer[ Calc.workingBuffer.length-1])) {
          break;
        }

        if (Calc.lastAnswer &&  Calc.workingBuffer.length === 0) {
          Calc.resetWorkingBuffer();
          Calc.workingBuffer.push(Calc.lastAnswer);
          Calc.incrementBufferIndex();
        }

        Calc.workingBuffer.splice(Calc.bufferIndex+1,1,input);
        Calc.incrementBufferIndex();
        console.log(Calc.bufferIndex);
        Calc.renderWorkingBuffer();
        break;

      case '=':
        // check if user is simply trying to compute the same equation
        if ( Calc.workingBuffer.length === 0) {
          break;
        }
        // do not allow user to commit a computation is unsafe (eg. parentheses are not closed, division by 0)
        if (!calculationLegal()) {
          break;
        }
        Calc.pushWorkingBuffer();
        // Compute and store result as last answer
        Calc.lastAnswer = Calc.computeExpression(Calc.computeBuffer);
        // push the result to display buffer
        Calc.pushComputeResult();
        console.log(Calc.displayBuffer, Calc.workingBuffer, Calc.computeBuffer);
        // convert the result to a format that will fit the calculator screen (ie. if necessary, express value in sci notation to fit display)
        Calc.tailorDisplayBuffer()
        // render the result to the calculator display
        Calc.renderDisplayBuffer();
        Calc.resetWorkingBuffer();
        Calc.disengageReplayMode();
        break;

      case 'SHIFT':
        if ( Calc.shiftKeyPressed ) {
          Calc.deactivateShiftKey();
        } else {
          Calc.activateShiftKey();
        }
        break;

      case 'M':
        // if the shift key has been engaged, store the current buffer in
        // memory, otherwise recall the memory
        if (Calc.shiftKeyPressed) {
          Calc.memoryValue = Calc.getRenderedDisplayContent();
          console.log('storing ', Calc.memoryValue, ' in memory!');
          Calc.deactivateShiftKey();
          Calc.activateMemKey();
        } else {
          // if there is a value in memory
          if (Calc.memoryValue) {
            console.log('retrieving a value from Calc\'s memory');
            console.log('Calc.displayBuffer = ',  Calc.displayBuffer);
            //$('#display').html(memory);
             Calc.workingBuffer.push(Calc.memoryValue);
             Calc.renderWorkingBuffer();
          }
        }
        break;

      case '%':;
        Calc.workingBuffer.splice(Calc.bufferIndex+1,1,'%');
        Calc.incrementBufferIndex();
        Calc.pushWorkingBuffer();
        Calc.lastAnswer = Calc.computePercentage(Calc.computeBuffer);
        Calc.pushComputeResult();
        Calc.tailorDisplayBuffer();
        Calc.renderDisplayBuffer();
        Calc.resetComputeBuffer();
        break;

      case 'Inv':
        Calc.displayBuffer = 1.0 / Calc.displayBuffer;
        Calc.renderDisplayBuffer();
        break;

      case 'Exp':
        Calc.workingBuffer.splice(Calc.bufferIndex+1,1,'E');
        Calc.incrementBufferIndex();
        Calc.renderWorkingBuffer();
        break;


      case 'Ans':
        if (Calc.lastAnswer === undefined) {
          Calc.lastAnswer = 0;
        }
        Calc.workingBuffer.push('Ans');
        // if an value has been evaluated since the Calc is on
        // then recall that value
        // first making sure that user cannot stack the answer in display
        if ( Calc.getRenderedDisplayContent() == Calc.lastAnswer ) {
          Calc.resetDisplayBuffer();
        }
        if ( ( Calc.displayBuffer[0] === Calc.lastAnswer) && ( Calc.displayBuffer.length === 0) ) {
          Calc.resetDisplayBuffer();
           Calc.displayBuffer.push(Calc.lastAnswer);
        }
        if ( Calc.lastAnswer ) {
          if (Calc.specialInputActive) {
            if (getInsertionIndex( Calc.displayBuffer,'x')) {
               Calc.displayBuffer.splice(getInsertionIndex( Calc.displayBuffer, 'x'),1,Calc.lastAnswer);
            } else {
               Calc.displayBuffer.splice(getInsertionIndex( Calc.displayBuffer, ')'),0,Calc.lastAnswer);
            }
          } else {
             Calc.displayBuffer.push(Calc.lastAnswer);
          }
        }
        Calc.renderWorkingBuffer();
        break;

    }
  },

  tailorDisplayBuffer: function() {
    var result = Calc.displayBuffer;
    if ( Calc.scienceOn && result.toString().length > 14 ) {
      Calc.displayBuffer = result.toExponential(12);
    } else if ( result.toString().length > 10 ) {
      Calc.displayBuffer = result.toExponential(8);
    } else {
      Calc.displayBuffer = result;
    }
  },

  computePercentage: function(arr) {

    function squashBuffer() {
      // squash any part of the buffer that is in between orperators or the beginning/end
      if ( Calc.isOperator(buffer[searchIndex]) || searchIndex === 0 ) {
        if ( Calc.isOperator(buffer[searchIndex]) ) {
          var squashStart = searchIndex + 1;
        } else if (searchIndex === 0) {
          var squashStart = 0;
        }
        var squashEnd = null;
        for (var i = squashStart; i < buffer.length; i++) {
          if ( Calc.isOperator(buffer[i]) ) {
            squashEnd = i - 1;
            break;
          } else if ( Calc.isSpecialOperator(buffer[i]) ) {
            // do not squash portions of the array that contain trigonometric functions
            return;
          }
        }
        if (squashEnd === null) {
          squashEnd = buffer.length-1;
        }
        // do not do anything if search is at extremities
        if (squashStart === squashEnd) {
          return;
        }
        var rollArr = [];
        for (var i = squashStart; i <= squashEnd; i++) {
          rollArr.push(buffer[i]);
        }
        var spliceLength = rollArr.length;
        var roll = rollArr.join('');
        buffer.splice(squashStart,spliceLength,roll);
        searchIndex = squashStart;
      } else {
        return;
      }
    }

    var buffer = arr;
    var searchIndex = buffer.length-2;
    do {
      squashBuffer();
      if (searchIndex === 0) {
        break;
      } else {
        searchIndex--;
      }
    } while (searchIndex >= 0);
    console.log('buffer from percentagesCompute = ', buffer);

    console.log(eval(buffer[0]), eval(buffer[2]) );

    switch(buffer[1]) {
      case '/':
        percentageResult =  eval(buffer[0]) /  eval(buffer[2]) * 100;
        break;
      case 'x':
        percentageResult =  eval(buffer[0]) *  eval(buffer[2]) / 100;
        break;
      case '+':
        percentageResult =  eval(buffer[0]) * ( 100 +  eval(buffer[2]) ) / 100;
        break;
      case '-':
        percentageResult =  eval(buffer[0]) * ( 100 -  eval(buffer[2]) ) / 100;
        break;
    }
    return percentageResult;

  },

  computeExpression: function(arr) {

    // recursive factorial caluclation
    function evalFactorial(x) {
      var x = Number(x);
      if (x === 1) {
        return 1;
      } else {
        return x * evalFactorial(x-1);
      }
    }

    // computes expressions surrounded by operators
    function operatorCompute(operatorStr, bufferIndex) {

      var opIndex = bufferIndex;
      var belowEIndex = opIndex - 1;
      var belowSIndex;
      for (var i = belowEIndex; i >= 0; i--) {
        if (i === 0) {
          belowSIndex = 0;
          break;
        } else if ( Calc.isOperator(buffer[i]) ) {
        belowSIndex = i + 1;
          break;
        }
      }
      var belowArr = [];
      for (var i = belowSIndex; i <= belowEIndex; i++) {
        belowArr.push(buffer[i]);
      }
      console.log('belowArr = ', belowArr);
      var aboveSIndex = opIndex + 1;
      var aboveEIndex;
      for (var i = aboveSIndex; i <= buffer.length-1; i++) {
        if (i === buffer.length-1) {
          aboveEIndex = buffer.length-1;
          break;
        } else if ( Calc.isOperator(buffer[i]) ) {
          aboveEIndex = i - 1;
          break;
        }
      }
      var aboveArr = [];
      for (var i = aboveSIndex; i <= aboveEIndex; i++) {
        aboveArr.push(buffer[i]);
      }
      console.log('aboveArr = ', aboveArr);

      var spliceLength = belowArr.length + aboveArr.length + 1;
      var spliceIndex = belowSIndex;

      switch(operatorStr) {
        case '+':
          var result = parseFloat(belowArr.join('')) + parseFloat(aboveArr.join(''));
          console.log('opStr = ', operatorStr, 'buffI = ', bufferIndex, 'result = ', result);
          break;
        case '-':
          var result = parseFloat(belowArr.join('')) - parseFloat(aboveArr.join(''));
          console.log('opStr = ', operatorStr, 'buffI = ', bufferIndex, 'result = ', result);
          break;
        case 'x':
          var result = parseFloat(belowArr.join('')) * parseFloat(aboveArr.join(''));
          console.log('opStr = ', operatorStr, 'buffI = ', bufferIndex, 'result = ', result);
          break;
        case '/':
          var result = parseFloat(belowArr.join('')) / parseFloat(aboveArr.join(''));
          console.log('opStr = ', operatorStr, 'buffI = ', bufferIndex, 'result = ', result);
          break;
        case 'sqrt':
          var result = Math.sqrt( eval(aboveArr.join('')) );
        case 'sin':
          if ( belowArr.length === 0 ) {
            var result = Math.sin( eval(aboveArr.join('')) );
          } else {
            var result = Math.sin( eval(aboveArr.join('')) );
            // var result = parseFloat(belowArr.join('')) * Math.sin( eval(aboveArr.join('')) );
          }
          console.log('opStr = ', operatorStr, 'buffI = ', bufferIndex, 'result = ', result);
          break;
        default:
          console.log('Error: Foreign operator "' + operatorStr + '" passed to operatorCompute.');
      }
      return [spliceIndex, spliceLength, result];
    }


    /*
     * squash parts of the buffer that are between operators or operator and an extremity
     * to turn eg. [3,3] into 33 and [2,.,8,5] into 2.85
     */
    function squashBuffer() {
      if ( Calc.isOperator(buffer[searchIndex]) || searchIndex === 0 ) {
        if ( Calc.isOperator(buffer[searchIndex]) ) {
          var squashStart = searchIndex + 1;
        } else if (searchIndex === 0) {
          var squashStart = 0;
        }
        var squashEnd = null;
        for (var i = squashStart; i < buffer.length; i++) {
          if ( Calc.isOperator(buffer[i]) ) {
            squashEnd = i - 1;
            break;
          } else if ( Calc.isSpecialOperator(buffer[i]) ) {
            // do not squash portions of the array that contain trig or sqrt functions
            return;
          }
        }
        if (squashEnd === null) {
          squashEnd = buffer.length-1;
        }
        // do not do anything if search is at extremities
        if (squashStart === squashEnd) {
          return;
        }
        var rollArr = [];
        for (var i = squashStart; i <= squashEnd; i++) {
          rollArr.push(buffer[i]);
        }
        var spliceLength = rollArr.length;
        var roll = rollArr.join('');
        buffer.splice(squashStart,spliceLength,roll);
        searchIndex = squashStart;
      } else {
        return;
      }
    }

    var buffer = arr;
    var total = 0;
    var searchIndex = buffer.length-2;
    var expDecimalValue;

    console.log('computing buffer ', buffer);

    if ( buffer.length === 1 && buffer[0] === 'Ans' ) {
      // make sure that the actual answer is written out to the screen
      return Calc.lastAnswer;
    } else if (buffer.length === 1) {
      // skip any further computation if only one value in computation matrix
      return buffer.join('');
    }

    // deal with expressions in parentheses recursively
    do {
      // find the last set of parentheses
      if (buffer[searchIndex] === '(') {
        var pSIndex = searchIndex + 1;
        var pEIndex;
        for (var i = buffer.length-1; i >= 0; i--) {
          if (buffer[i] === ')') {
            pEIndex = i - 1;
          }
        }
        // splice in compute of the expression in parentheses
        var pExpr = [];
        for (var i = pSIndex; i <= pEIndex; i++) {
          pExpr.push(buffer[i]);
        }
        var spliceLength = pExpr.length + 2;
        console.log(pExpr);
        buffer.splice(pSIndex,spliceLength,Calc.computeExpression(pExpr));
        searchIndex = pSIndex;
      }
      searchIndex--;

    } while (searchIndex >= 0);

    // Substitute value of lastAnswer for any 'Ans' in buffer
    buffer.forEach(function(entry,index) {
      if (entry === 'Ans') {
        buffer.splice(index,1,Calc.lastAnswer);
      }
    });

    // search between previous operator and '!' sign to substitute out
    // to get value to factorialise, noting the index at which the calculation
    // will need to be inserted and the splice length.
    searchIndex = buffer.length-1;
    do {
      if (buffer[searchIndex] === '!') {
        var fEIndex = searchIndex;
        var fSIndex;
        for (var i = fEIndex; i >= 0; i--) {
          console.log(i);
          if (i === 0) {
            fSIndex = 0;
            break;
          } else if ( Calc.isOperator(buffer[i]) ) {
            fSIndex = i;
            break;
          }
        }
        if (fSIndex === undefined) {
         console.log('Error: There was an issue finding start index of factorial substitution.');
        }
        var fExpr = [];
        for (var i = fSIndex; i < fEIndex; i++) {
          console.log('i');
          fExpr.push(buffer[i]);
        }
        console.log('fExpr', fExpr);
        var spliceLength = fExpr.length + 1;
        buffer.splice(fSIndex,spliceLength,evalFactorial(fExpr.join('')));
        searchIndex = fSIndex;
      }
      searchIndex--;
    } while (searchIndex > 0);

    // deal with 'Exp' scientific input in the buffer
    if (buffer.length >= 3) {
      searchIndex = buffer.length-1;
      do {
        if (buffer[searchIndex] === "E") {
          var expESIndex = searchIndex + 1; // exponent start index
          var expEEIndex; // exponent end index
          for (var i = expESIndex; i < buffer.length; i++) {
            if (i === buffer.length-1) {
              expEEIndex = buffer.length-1;
              break;
            } else if ( Calc.isOperator(buffer[i]) ) {
              expEEIndex = i - 1;
              break;
            }
          }
          if (expEEIndex === undefined) {
             console.log('Error: There was an issue finding end index of a a scientific entry\'s exponent.');
          }
          var expEExpr = []; // exponent array
          for (var i = expESIndex; i <= expEEIndex; i++) {
            expEExpr.push(buffer[i]);
          }
          var expSEIndex = searchIndex - 1; // signficand end index
          var expSSIndex; // significand start index
          for (var i = expSEIndex; i >= 0; i--) {
            if (i === 0) {
              expSSIndex = 0;
              break;
            } else if ( Calc.isOperator(buffer[i]) ) {
              expSSIndex = i + 1;
              break;
            }
          }
          if (expSSIndex === undefined) {
             console.log('Error: There was an issue finding start index of a a scientific entry\'s significand.');
          }
          var expSExpr = []; // significand array
          for (var i = expSSIndex; i <= expSEIndex; i++) {
            expSExpr.push(buffer[i]);
          }
          var spliceLength = expSExpr.length + expEExpr.length + 1;
          var expExpr = expSExpr.join('') * Math.pow(10, expEExpr.join(''));
          console.log(expExpr);
          buffer.splice(expSSIndex,spliceLength,expExpr);
          searchIndex = expSSIndex;
        }
        searchIndex --;
      } while ( searchIndex > 0 );
    }

    // squash buffer between operators
    console.log('buffer before squash = ', buffer);
    searchIndex = buffer.length-2;
    do {
      squashBuffer();
      if (searchIndex === 0) {
        break;
      } else {
        searchIndex--;
      }
    } while (searchIndex >= 0);
    console.log('buffer after squash = ', buffer);
    // dirty fix for leftover empty strings after squash
    for (var i = 1; i < buffer.length; i++) {
      if (buffer[i] === '' || buffer[i] === 0) {
        buffer.splice(i,1);
      }
    }
    console.log('buffer after squash and artifact cleanup = ', buffer);

    // evaluate trig and sqrt operations
    searchIndex = buffer.length-1;
    do {
      if ( Calc.isSpecialOperator(buffer[searchIndex]) ) {
        var spliceArr = operatorCompute(buffer[searchIndex],searchIndex);
        buffer.splice(spliceArr[0],spliceArr[1],spliceArr[2]);
        searchIndex = spliceArr[0];
        console.log('spliceArr = ',  spliceArr);
        console.log('buffer = ', buffer);
      }
      if (searchIndex === 0) {
        break;
      } else {
        searchIndex--;
      }
    } while (searchIndex > 0);

    console.log('buffer = ', buffer);
    // evaluate higher precedence operations
    searchIndex = buffer.length-1;
    do {
      if ( Calc.isHPOperator(buffer[searchIndex]) ) {
        var spliceArr = operatorCompute(buffer[searchIndex], searchIndex);
        buffer.splice(spliceArr[0],spliceArr[1],spliceArr[2]);
        searchIndex = spliceArr[0];
        console.log('spliceArr = ',  spliceArr);
        console.log('buffer = ', buffer);
      }
      console.log('compute buffer = ', buffer);
      if (searchIndex === 0) {
        break;
      } else {
        searchIndex--;
      }
    } while (searchIndex > 0);

    console.log('final buffer before additional operations = ', buffer);
    // turn the buffer into a string an then do additional work to detect where
    // Math.sin should be inserted etc.., square root applied, etc...
    var bufferStr = buffer.join('');
    console.log(bufferStr);
    for (var i = 0; i < bufferStr.length; i++) {
      console.log(buffer[i] + '\n');
    }

    // TODO:
    // in order to restore the original buffer, store it as a variable and have it
    // posted to the workingbUffer instead of being replaced by ?



    // clean up and evaluate
    for (var i = 0; i < buffer.length; i++) {
      if (buffer[i] === '+') {
        buffer.splice(i,1);
      } else if (buffer[i] === 'x') {
        buffer.splice(i,1,'*');
      }
    }
    var total = eval(buffer.join('+'));
    console.log(total);
    return total;


    // // Simplify additive inversion of entries
    // console.log('starting additive inversion processing');
    // searchIndex = buffer.length-2;
    // do {
    //   // if a '-' operator is found squash it onto next value in buffer
    //   console.log('buffer = ', buffer);
    //   if (buffer[searchIndex] === '-') {
    //     console.log('found a  "-" at index ' , searchIndex);
    //     var negIndex = searchIndex;
    //     var targetIndex = negIndex + 1;
    //     buffer.splice(negIndex,2,-buffer[targetIndex]);
    //     console.log('buffer = ', buffer);
    //   }
    //   searchIndex--;
    // } while (searchIndex >= 0);
    // console.log('finished additive inversion processing');
    //
    //
    //
    // console.log('buffer = ', buffer);
    // // evaluate lowest precedence operations
    // searchIndex = buffer.length-1;
    // do {
    //   if ( Calc.isLPOperator(buffer[searchIndex]) ) {
    //     var spliceArr = operatorCompute(buffer[searchIndex], searchIndex);
    //     buffer.splice(spliceArr[0],spliceArr[1],spliceArr[2]);
    //     searchIndex = spliceArr[0];
    //     console.log('spliceArr = ',  spliceArr);
    //     console.log('buffer = ', buffer);
    //   }
    //   console.log('compute buffer = ', buffer);
    //   if (searchIndex === 0) {
    //     break;
    //   } else {
    //     searchIndex--;
    //   }
    // } while (searchIndex > 0);
    //
    // console.log('buffer length = ', buffer.length);
    // console.log('buffer = ', buffer);
    // var total = eval(buffer.join('+'));
    // if (isNaN(total) ) {
    //   return 'error';
    // }
    // console.log(total);
    // return total;
  },

  offTimer: function() {
    Calc.powerOff();
    Calc.resetComputeBuffer();
    Calc.resetDisplayBuffer();
    Calc.renderDisplayBuffer();
    Calc.deactivateShiftKey();
    // Calc.refreshDisplay();
    Calc.eraseWorkingBuffer();
  }

};

// TODO: timer for working buffer cursor, only on when calc is on
// TODO: bug with input being accepted in working buffer when calc not on

/* MAIN */

var onTimerId = window.setTimeout(Calc.offTimer, 60000);

$('#controls-wrapper').on('click', '.button', function() {
  var input = Calc.interpretKeypress(this.id);
  Calc.respondToInput(input);
  // if ( !$(this).hasClass('button-mod') || input === "M" ) {
  //   Calc.refreshDisplay();
  // }
  window.clearTimeout(onTimerId);
  onTimerId = window.setTimeout(Calc.offTimer, 60000);
});

// NOTE: Disabled as sci is work in progress
// $('.switch').on('click', function() {
//   if (Calc.scienceOn) {
//     Calc.makeUnscientific();
//   } else {
//     Calc.makeScientific();
//   }
//   $('#calculator-body').toggleClass('scientific-calc');
//   // general hack to avoid having to worry about truncating the user input if Calc
//   // is switched back from scientific mode to standard
//   if (Calc.isPoweredOn()) {
//     Calc.zeroDisplayBuffer();
//     Calc.resetComputeBuffer();
//     // Calc.refreshDisplay();
//     Calc.eraseWorkingBuffer();
//   }
// });

$('#instructions').on('click', function() {
  $(this).toggleClass('instructions-shown');
});
