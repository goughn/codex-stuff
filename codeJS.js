var pyodideReadyPromise = loadPyodide();
console.log("type 106 github vB2");
console.log("=== codeJS.js LOADED ===", new Date().toISOString());
function createTextArea() {
    // Find the first element with class 'instanceHolder'
    var closeHolderDiv = document.querySelector('.instanceHolder');

    if (closeHolderDiv) {
      // Create the textarea
      var textarea = document.createElement('textarea');
      //textarea.id = 'console-output';
      
      // Optional: Set some default styles or attributes
      textarea.rows = 10;
      textarea.cols = 50;
      textarea.placeholder = 'Console output will appear here...';

      // Append the textarea to the div
      closeHolderDiv.appendChild(textarea);
    } else {
      console.warn('No element with class "instanceHolder" found.');
    }
}


function setItem_106(itemInstance, instanceObj) {
    console.log("File NoteBookInstance_Pyodide.js");
    console.log("id: " + instanceObj.iid);
    answerElement = itemInstance.querySelector(".answer");

    if (answerElement.value.trim() != "") {
        resp = JSON.parse(answerElement.value);
        answerElement.value = resp.code;
    }
    
    // create a div for the execution of the phython similar to the file NoteBookInstance_HTML.js
    itemid = itemInstance.id;
    comp = document.createElement("div");
    //comp.setAttribute("id", "d" + itemid);
    comp.id = "o" + itemInstance.id; //'console-output';
    comp.setAttribute("class", "itemContent viewAnswer");
    comp.setAttribute(
        "style",
        "background-color:white; width: 50%; float: right;"
    );
    answer = itemInstance.querySelector(".answer");
    answer.parentNode.insertBefore(comp, answer);
    answer.style.width = "44%";
    answer.setAttribute("id", "t" + itemid);
    
    problemElement = itemInstance.querySelector(".problem");

    pElement = document.createElement("P");
    problemElement.appendChild(pElement);

    runCodeButtonElement = document.createElement("button");
    runCodeButtonElement.setAttribute("type", "button");  // with default it sends the form
    runCodeButtonElement.addEventListener("click", async function () {
        var originalText = this.textContent;
        this.textContent = "Loading...";
        this.disabled = true;
        try {
            await runPython2(this);
        } finally {
            this.textContent = originalText;
            this.disabled = false;
            
            // Mover el canvas desde JavaScript
            setTimeout(() => {
                var divMatplotlib = obtenerUltimoDivMatplotlib();
                if (divMatplotlib) {
                    console.log('Encontrado div matplotlib:', divMatplotlib.id);
                    // Mover a donde necesites
                    instanceHolder
                    var contenedor = runCodeButtonElement.parentElement;
                    document.body.insertBefore(divMatplotlib, document.getElementsByClassName("banner")[0]);
                } else {
                    console.log('No se encontrÃ³ div matplotlib');
                }
            }, 100); // PequeÃ±a pausa para que se renderice el canvas
        }
    });
    runCodeButtonElement.innerHTML = "Run Code";
    
    if (answer && answer.parentNode) {
        answer.parentNode.insertBefore(runCodeButtonElement, answer.nextSibling);
    }
    
    
    //createTextArea();
}

function obtenerUltimoDivMatplotlib() {
    var divsEnBody = document.body.querySelectorAll('body > div');
    
    if (divsEnBody.length > 0) {
        var ultimoDiv = divsEnBody[divsEnBody.length - 1];
        
        if (ultimoDiv.id && ultimoDiv.id.startsWith('matplotlib')) {
            return ultimoDiv;
        }
    }
    
    return null;
}

async function runPython2(button) {
  var pyodide = await pyodideReadyPromise;
  await pyodide.loadPackage("numpy");
  await pyodide.loadPackage("matplotlib");

    itemInstance = button.closest(".itemInstance");
    instanceID = itemInstance.getAttribute("id");
    pyCode = itemInstance.querySelector(".answer").value;

  // Look for tests in the problem div
  let problemDiv = itemInstance.querySelector(".problem");
  let tests = [];
  let testOutputs = [];
  
  if (problemDiv && problemDiv.hasAttribute('data-tests')) {
    try {
      tests = JSON.parse(problemDiv.getAttribute('data-tests'));
      console.log("Found tests:", tests);
    } catch (e) {
      console.log("Could not parse data-tests:", e);
    }
  }

  // Redirige stdout
  let outputDiv = document.getElementById("o" + instanceID);
  outputDiv.textContent = "";

  pyodide.setStdout({
    batched: (s) => outputDiv.textContent += s,
  });

  pyodide.setStderr({
    batched: (s) => outputDiv.textContent += s,
  });

  try {
    // First, run the user's code to define functions
    await pyodide.runPythonAsync(pyCode);
    
    if (tests.length > 0) {
      // Run first test and show output
      let firstTest = tests[0];
      outputDiv.textContent += `\n=== Running Test 1: ${firstTest.description} ===\n`;
      
      // Extract just the function call part (before assert)
      let testCode = firstTest.test.split('\nassert')[0];
      let firstOutput = await runTestAndCaptureOutput(pyodide, testCode);
      outputDiv.textContent += firstOutput + "\n";
      testOutputs.push(firstOutput);
      
      // Run remaining tests silently
      for (let i = 1; i < tests.length; i++) {
        let test = tests[i];
        let testCode = test.test.split('\nassert')[0];
        let output = await runTestAndCaptureOutput(pyodide, testCode);
        testOutputs.push(output);
      }
      
      console.log("All test outputs:", testOutputs);
      
      // Store test outputs for saveAnswer_106
      itemInstance.testOutputs = testOutputs;
      
    } else {
      console.log("No tests found, running code normally");
    }
    
  } catch (err) {
    outputDiv.textContent += "\n" + err;
  }
}

// Helper function to run test code and capture output
async function runTestAndCaptureOutput(pyodide, testCode) {
  let capturedOutput = "";
  
  // Temporarily redirect stdout to capture test output
  let originalStdout = pyodide.runPython("import sys; sys.stdout");
  
  pyodide.setStdout({
    batched: (s) => capturedOutput += s,
  });
  
  try {
    await pyodide.runPythonAsync(testCode);
    
    // If no output was printed, try to get the result value
    if (capturedOutput.trim() === "") {
      let result = pyodide.runPython(`
try:
    result
except NameError:
    "No result"
`);
      capturedOutput = result ? result.toString() : "No output";
    }
    
  } catch (err) {
    capturedOutput = "Error: " + err.toString();
  }
  
  // Restore original stdout behavior
  pyodide.setStdout({
    batched: (s) => {
      let outputDiv = document.getElementById("o" + document.querySelector(".itemInstance").id);
      if (outputDiv) outputDiv.textContent += s;
    },
  });
  
  return capturedOutput.trim();
}

function saveAnswer_106(button) {
    var respObject = {};
    itemInstance = button.closest(".itemInstance");
    pyCode = itemInstance.querySelector(".answer").value;
    respObject.code = pyCode;

    // Use test outputs array if available, otherwise fall back to single output
    if (itemInstance.testOutputs && itemInstance.testOutputs.length > 0) {
        respObject.output = itemInstance.testOutputs;
        console.log("Sending test outputs array:", itemInstance.testOutputs);
    } else {
        // Fallback to original behavior if no tests were run
        let outputDiv = document.getElementById("o" + itemInstance.id);
        output = outputDiv.textContent;
        respObject.output = output;
        console.log("No test outputs found, sending single output:", output);
    }
    
    resp = JSON.stringify(respObject);
    return resp;
}
