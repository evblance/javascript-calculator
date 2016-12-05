
var activeColour = 'grey';
var inactiveColour = 'white';

var Calculator = {
  workingBuffer: [],
  displayReadout: [],
  lastAnswer: undefined,
  shiftKeyPressed: false,
  activeExpKey: false,
  negationActive: false,
  answerStored: false,
  memoryValue: undefined,
  
  renderDisplay: function(data) {
    $('#display').html(data);
  },
  
  getRenderedDisplayContent: function() {
    return $('#display').html();
  },
  
  refreshDisplay: function() {
    // function to show the contents of the displayReadout property.
    var displayed;
    // somehow deal with output that would overflow the display range
    // could also do this with an inputAllowed Boolean variable ie.
    // if there is no space left, do not allow further digit input.
    if ( Calculator.displayReadout.length >= 14 ) {
      displayed = "too long...";
      Calculator.renderDisplay(displayed);
      return;
    }
    displayed = Calculator.displayReadout.join('');
    Calculator.renderDisplay(displayed);
  },
  
  resetDisplayReadout: function() {
    Calculator.displayReadout = [];
  },
  
  zeroDisplayReadout: function() {
    Calculator.displayReadout = [0];
  },
  
  resetWorkingBuffer: function() {
    Calculator.workingBuffer = [];
  },
  
  setLastAnswer: function(result) {
    Calculator.lastAnswer = result;
  },
  
  getLastAnswer: function() {
    return this.lastAnswer;
  },
  
  lastEntryIsOperand: function() {
    switch ( Calculator.workingBuffer[Calculator.workingBuffer.length-1] ) {
      case '+':
        return true;
      case '-':
        return true;
      case '*':
        return true;
      case '/':
        return true;
    }
    return false;
  },
  
  highlightKey: function(keySelector) {
    keySelector.css('border-color', activeColour);
  },
  
  unhighlightKey: function(keySelector) {
    keySelector.css('border-color', inactiveColour);
  },
  
  activateShiftKey: function() {
    Calculator.shiftKeyPressed = true;
    Calculator.highlightKey($('#key-shift'));
  },
  
  deactivateShiftKey: function() {
    Calculator.shiftKeyPressed = false;
    Calculator.unhighlightKey($('#key-shift'));
  },
  
  activateMinusKey: function() {
    Calculator.highlightKey($('#key-subtract'));
  },
  
  deactivateMinusKey: function() {
    Calculator.unhighlightKey($('#key-subtract'));
  },
  
  activatePercentageKey: function() {
    Calculator.highlightKey($('#key-percent'));
  },
  
  deactivatePercentageKey: function() {
    Calculator.unhighlightKey($('#key-percent'));
  },
  
  activateMemKey: function() {
    Calculator.highlightKey($('#key-mem'));
  },
  
  deactivateMemKey: function() {
    Calculator.memoryValue = undefined;
    Calculator.unhighlightKey($('#key-mem'));
  },
  
  activateExpKey: function() {
    Calculator.highlightKey($('#key-exp'));
    Calculator.activeExpKey = true;
  },
  
  deactivateExpKey: function() {
    Calculator.unhighlightKey($('#key-exp'));
    Calculator.activeExpKey = false;
  },
  
  makePowerOfTen: function() {
    var val = Calculator.readoutDisplay.length - 3 * Math.pow(10, Calculator.readoutDisplay.length - 1);
    Calculator.readoutDisplay.splice(Calculator.readoutDisplay.length - 3, 3, val);
  },

  commitEnteredValue: function() {
    Calculator.workingBuffer.push(Calculator.displayReadout.join(''));
  },
  
  parseInput: function( buttonID ) {
    switch( buttonID ) {
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
        return "*";
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
      case 'key-ce':
        return 'CE';
      case 'key-ac':
        return 'AC';
      case 'key-answer':
        return 'Ans';
    }
  },
  
  respondToInput: function(input) {
     // start a new calculation after user gives input following a computation
    if ( Calculator.workingBuffer[Calculator.workingBuffer.length - 1] == "=" ) {
      Calculator.resetDisplayReadout();
      Calculator.resetWorkingBuffer();
    } else if ( Calculator.workingBuffer[Calculator.workingBuffer.length-1] == "E" ) {
      Calculator.resetDisplayReadout();
      Calculator.deactivateExpKey();
    }
    
    // remove inital 0 from array (artifact of showing user that calc has reset)
    if ( Calculator.displayReadout[0] === 0 ) {
      Calculator.displayReadout.pop();
    }
    
    // remove 'percentage' context in case the percentage functions were used to generate a value
    Calculator.deactivatePercentageKey();
    
    // deactivate Exp key depending on context
    if ( Number.isInteger(input) ) {
      Calculator.deactivateExpKey();
    }
    if ( Calculator.negationActive ) {
      Calculator.displayReadout.push('-');
      Calculator.negationActive = false;
      Calculator.deactivateMinusKey();
    }
    // process input
    switch( input ) {
      case 1:
        Calculator.displayReadout.push(1);
        break;

      case 2:
        Calculator.displayReadout.push(2);
        break;

      case 3:
        Calculator.displayReadout.push(3);
        break;

      case 4:
        Calculator.displayReadout.push(4);
        break;

      case 5:
        Calculator.displayReadout.push(5);
        break;

      case 6:
        Calculator.displayReadout.push(6);
        break;

      case 7:
        Calculator.displayReadout.push(7);
        break;

      case 8:
        Calculator.displayReadout.push(8);
        break;

      case 9:
        Calculator.displayReadout.push(9);
        break;

      case 0:
        Calculator.displayReadout.push(0);
        break;

      case '.':
        Calculator.displayReadout.push('.');
        break;

      case '+':
        Calculator.commitEnteredValue();
        Calculator.workingBuffer.push('+');
        Calculator.resetDisplayReadout();
        break;

      case '-':
        if ( Calculator.activeExpKey ) {
          Calculator.negationActive = true;
          Calculator.activateMinusKey();
        } else if ( Calculator.lastEntryIsOperand() ) {
          Calculator.negationActive = true;
          Calculator.activateMinusKey();
        } else {
          Calculator.commitEnteredValue();
          Calculator.workingBuffer.push('-');
          Calculator.resetDisplayReadout();
        }

        break;

      case '*':
        Calculator.commitEnteredValue();
        Calculator.workingBuffer.push('*');
        Calculator.resetDisplayReadout();
        break;

      case '/':
        Calculator.commitEnteredValue();
        Calculator.workingBuffer.push('/');
        Calculator.resetDisplayReadout();
        break;

      case '=':
        Calculator.commitEnteredValue();
        Calculator.workingBuffer.push('=');
        var result = Calculator.compute();
        Calculator.lastAnswer = result;
        Calculator.resetDisplayReadout();
        // if the output will be longer than 10 digits,
        // then convert the result to scientific notation
        Calculator.outputCalculationResult(result);
        break;
        
      case 'SHIFT':
        if ( Calculator.shiftKeyPressed ) {
          Calculator.deactivateShiftKey();
        } else {
          Calculator.activateShiftKey();
        }
        break;

      case 'M':
        /* 
         * Memory Functionality:
         * If shift key has been engaged,
         * then store the value currently in matrix into memory
         * otherwise, recall the memory value for use
         */
        if ( Calculator.shiftKeyPressed && Calculator.displayReadout.length > 0 ) {
          Calculator.memoryValue = Calculator.getRenderedDisplayContent();
          console.log('storing ', Calculator.memoryValue, ' in memory!');
          Calculator.deactivateShiftKey();
          Calculator.activateMemKey();
        } else {
          // if there is a value in memory
          if ( Calculator.memoryValue ) {
            alert('retrieving a value from Calculator\'s memory');
            alert('Calculator.displayReadout = ', Calculator.displayReadout);
            //$('#display').html(memory);
            Calculator.displayReadout.push(Calculator.memoryValue); 
          }
        }
        break;

      case '%':
        if ( Calculator.shiftKeyPressed ) {
          Calculator.workingBuffer.push(Calculator.displayReadout.join(''));
          if ( Calculator.workingBuffer.length === 3 ) {
            var percentageResult;
            var wrkBuff = Calculator.workingBuffer;
            switch( wrkBuff[1] ) {
              case "/":
                percentageResult = wrkBuff[0] / wrkBuff[2] * 100;
                break;
              case "*":
                percentageResult = wrkBuff[0] * wrkBuff[2] / 100;
                break;
              case "+":
                percentageResult = wrkBuff[0] * ( 100 + wrkBuff[2] ) / 100;
                break;
              case "-":
                percentageResult = wrkBuff[0] * ( 100 - wrkBuff[2] ) / 100;
                break;
            }
            Calculator.resetWorkingBuffer();
            Calculator.resetDisplayReadout();
            Calculator.outputCalculationResult(percentageResult);
            Calculator.lastAnswer = percentageResult;
            Calculator.refreshDisplay();
            Calculator.deactivateShiftKey();
            Calculator.activatePercentageKey();
          } else {
            return false;
          }
        }
        break;

      case 'Exp':
        //Calculator.workingBuffer.push(Calculator.displayReadout.join(''));
        Calculator.displayReadout.push('E');
        Calculator.refreshDisplay();
        Calculator.activateExpKey();
        break;

      case 'AC':
        Calculator.zeroDisplayReadout();
        break;

      case 'CE':
        // check that the user isn't attempting to clear the memory
        if ( Calculator.shiftKeyPressed ) {
          // clear the memory
          Calculator.deactivateMemKey();
          Calculator.deactivateShiftKey();
        } else {
          // make sure that we will be able to erase single digits
          var stringifiedDisplayReadout = Calculator.displayReadout.toString();
          var sdrLength = stringifiedDisplayReadout.length;
          Calculator.resetDisplayReadout();
          for ( var i = 0; i < sdrLength; i+=2 ) {
            Calculator.displayReadout.push(stringifiedDisplayReadout[i]);
          }
          // delete digits on display as desired up to last one
          if ( Calculator.displayReadout.length > 1 ) {
            Calculator.displayReadout.pop();
          } else {
            /*
             * either a result was just displayed or we are
             * deleting the leading 0 from display
             */
            Calculator.zeroDisplayReadout();
          }
        }
        break;

      case 'Ans':
        // if an value has been evaluated since the calculator is on
        // then recall that value
        // first making sure that user cannot stack the answer in display
        if ( Calculator.getRenderedDisplayContent() == Calculator.lastAnswer ) {
          Calculator.resetDisplayReadout();
          Calculator.refreshDisplay();
        }
        if ( Calculator.displayReadout[0] === Calculator.lastAnswer && Calculator.displayReadout.length === 0 ) {
          Calculator.resetDisplayReadout();
          Calculator.refreshDisplay();
          Calculator.displayReadout.push(Calculator.lastAnswer);
        }
        if ( Calculator.lastAnswer ) {
          Calculator.displayReadout.push(Calculator.lastAnswer);
          Calculator.refreshDisplay();
        }
        break;      
    }
  },
  
  outputCalculationResult: function(result) {
    var resultString = result.toString();
    if ( resultString.length > 10 ) {
      Calculator.displayReadout.push(result.toExponential(8));
    } else {
      Calculator.displayReadout.push(result);
    }
  },
  
  compute: function() {
    // prevent calculation from proceeding if user is dividing by 0
    for ( var i = 1; i < Calculator.workingBuffer.length ; i++ ) {
      if ( ( Calculator.workingBuffer[i] == 0 ) && ( Calculator.workingBuffer[i-1] === "/" ) ) {
        return 'Err: div by 0';
      }
    }
    
    // first search for the case of Exp and simplify the working buffer accordingly    
    var searchIndex = 1;
    var expDecimalValue;
    
    do {
      if ( Calculator.workingBuffer[searchIndex] === "E" ) {
        // negative exponent case
        if ( Calculator.workingBuffer[searchIndex+1] === "-" ) {
          expDecimalValue = Calculator.workingBuffer[searchIndex-1] * Math.pow(10, Calculator.workingBuffer[searchIndex+2]);
          // otherwise the exponent is positive
        } else {
          expDecimalValue = Calculator.workingBuffer[searchIndex-1] * Math.pow(10, Calculator.workingBuffer[searchIndex+1]);
        Calculator.workingBuffer.splice(searchIndex-1, 3, expDecimalValue);
        }
      }
      searchIndex += 2;
    } while ( searchIndex !== Calculator.workingBuffer.length-1 && Calculator.workingBuffer.length > 3 );
    
    // the iteratively evaluate higher precedence operations in entry order
    searchIndex = 1;
    var operationTotal = 0;
    do {
      if ( Calculator.workingBuffer[searchIndex] === "*" || Calculator.workingBuffer[searchIndex] === "/" ) {
        console.log('Calculator\'s working buffer looks like ', Calculator.workingBuffer);
        console.log('found a ', Calculator.workingBuffer[searchIndex], '!');
        switch( Calculator.workingBuffer[searchIndex] ) {
          case '*':
            operationTotal = Number(Calculator.workingBuffer[searchIndex-1]) * Number(Calculator.workingBuffer[searchIndex+1]);
            break;
          case '/':
            operationTotal = Number(Calculator.workingBuffer[searchIndex-1]) / Number(Calculator.workingBuffer[searchIndex+1]);
            break;
        }
        console.log('we are doing', Calculator.workingBuffer.slice(searchIndex-1, searchIndex+2), ' OK!');
        Calculator.workingBuffer.splice(searchIndex-1, 3, operationTotal);
        console.log('Calculator\'s working buffer now looks like ', Calculator.workingBuffer);
        // searchIndex remains the same since algorithm
        // inserts the operationTotal at searchIndex-1
        continue;
      }
      // increment search if no higher precedence operator found
      searchIndex += 2;
    } while ( searchIndex !== Calculator.workingBuffer.length-1 && Calculator.workingBuffer.length > 3 );
    
    // then deal with lowest precedence operations to produce total
    var total = Calculator.workingBuffer[0];
    var fFix = 1000;  // --> fix for floating point issues on add and substract
    for ( var i = 1; i < Calculator.workingBuffer.length-1; i += 2 ) {
      switch( Calculator.workingBuffer[i] ) {
        case '+':
          total = ( ( total * fFix + Number(Calculator.workingBuffer[i+1]) * fFix ) / fFix );
          break;
        case '-':
          total = ( ( total * fFix - Number(Calculator.workingBuffer[i+1]) * fFix ) / fFix );
          break;
        default:
          continue;
      }
    }
    return total;    
  }
  
}


$(document).ready(function() {
  $('.button').on('click', function() {
    var input = Calculator.parseInput(this.id);
    console.log(Calculator.workingBuffer);
    Calculator.respondToInput(input);
    if ( !$(this).hasClass('button-mod') || input === "M" ) {
      Calculator.refreshDisplay();
    }
  }); 
});
