var pyodideReadyPromise = loadPyodide();
console.log("type 106 github v2.1);
console.log("PLEASE WORK");
consloe.log("still not working");
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


function setItem_105(itemInstance, instanceObj) {
    console.log("File NoteBookInstance_Pyodide.js");
    console.log("id: " + instanceObj.iid);
    answerElement = itemInstance.querySelector(".answer");

    if (answerElement.value.trim() != "") {
        resp = JSON.parse(answerElement.value);
        answerElement.value = resp.code;
    }
    
    // create a div for the execution of the python similar to the file NoteBookInstance_HTML.js
    itemid = itemInstance.id;
    comp = document.createElement("div");
    comp.id = "o" + itemInstance.id;
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

    // Create buttons container
    const buttonsContainer = document.createElement("div");
    buttonsContainer.className = "python-buttons";
    buttonsContainer.style.marginTop = "10px";
    buttonsContainer.style.display = "flex";
    buttonsContainer.style.gap = "10px";

    // Create Run button
    const runButton = document.createElement("button");
    runButton.setAttribute("type", "button");
    runButton.className = "run-button";
    runButton.innerHTML = "Run Code";
    runButton.addEventListener("click", async function () {
        var originalText = this.textContent;
        this.textContent = "Running...";
        this.disabled = true;
        try {
            // Clear previous output
            const outputDiv = document.getElementById("o" + itemid);
            outputDiv.textContent = "";
            
            await runPython2(this);
        } finally {
            this.textContent = originalText;
            this.disabled = false;
            
            // Handle matplotlib output
            setTimeout(() => {
                var divMatplotlib = obtenerUltimoDivMatplotlib();
                if (divMatplotlib) {
                    console.log('Found matplotlib div:', divMatplotlib.id);
                    var contenedor = runButton.parentElement;
                    document.body.insertBefore(divMatplotlib, document.getElementsByClassName("banner")[0]);
                }
            }, 100);
        }
    });

    // Create Test button
    const testButton = document.createElement("button");
    testButton.setAttribute("type", "button");
    testButton.className = "test-button";
    testButton.innerHTML = "Run Tests";
    testButton.addEventListener("click", async function () {
        var originalText = this.textContent;
        this.textContent = "Testing...";
        this.disabled = true;
        try {
            // Clear previous output
            const outputDiv = document.getElementById("o" + itemid);
            outputDiv.textContent = "";
            
            // Get test cases from the problem element
            const problemElement = itemInstance.querySelector(".problem");
            const testCases = problemElement.getAttribute("data-tests");
            if (testCases) {
                const tests = JSON.parse(testCases);
                await runPythonTests(this, tests);
            } else {
                outputDiv.textContent = "No test cases defined for this problem.";
            }
        } finally {
            this.textContent = originalText;
            this.disabled = false;
        }
    });

    // Add buttons to container
    buttonsContainer.appendChild(runButton);
    buttonsContainer.appendChild(testButton);
    
    // Add buttons after the answer textarea
    if (answer && answer.parentNode) {
        answer.parentNode.insertBefore(buttonsContainer, answer.nextSibling);
    }

    // Add some basic styling
    const buttonStyle = document.createElement('style');
    buttonStyle.textContent = `
        .python-buttons button {
            padding: 8px 16px;
            border: none;
            border-radius: 4px;
            cursor: pointer;
            font-weight: bold;
            transition: background-color 0.2s;
        }
        .run-button {
            background-color: #4CAF50;
            color: white;
        }
        .run-button:hover {
            background-color: #45a049;
        }
        .test-button {
            background-color: #2196F3;
            color: white;
        }
        .test-button:hover {
            background-color: #1e88e5;
        }
        .run-button:disabled, .test-button:disabled {
            background-color: #cccccc;
            cursor: not-allowed;
        }
    `;
    document.head.appendChild(buttonStyle);
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
  //var code = document.getElementById("python-code").value;

    itemInstance = button.closest(".itemInstance");
    instanceID = itemInstance.getAttribute("id");
    pyCode = itemInstance.querySelector(".answer").value;

  // Redirige stdout
  //let outputDiv = document.getElementById("console-output");
  let outputDiv = document.getElementById("o" + instanceID);
  outputDiv.textContent = "";

  pyodide.setStdout({
    batched: (s) => outputDiv.textContent += s,
  });

  pyodide.setStderr({
    batched: (s) => outputDiv.textContent += s,
  });

  try {
    await pyodide.runPythonAsync(pyCode);
  } catch (err) {
    outputDiv.textContent += "\n" + err;
  }
}

function saveAnswer_105(button) {
    /* don't execute here because runPython2 is async 
    var originalText = button.textContent;
    button.textContent = "Executing...";
    button.disabled = true;

    await runPython2(button);
    console.log("executed runPython2");
    button.textContent = originalText;
    button.disabled = false;
    */
    var respObject = {};
    itemInstance = button.closest(".itemInstance");
    pyCode = itemInstance.querySelector(".answer").value;
    respObject.code = pyCode;

    //let outputDiv = document.getElementById("console-output");
    let outputDiv = document.getElementById("o" + itemInstance.id);
    output = outputDiv.textContent;
    respObject.output = output;
    resp = JSON.stringify(respObject);
    return resp;
}

async function runPythonTests(button, tests) {
    const itemInstance = button.closest(".itemInstance");
    const instanceID = itemInstance.getAttribute("id");
    const outputDiv = document.getElementById("o" + instanceID);
    const pyCode = itemInstance.querySelector(".answer").value;
    
    // Clear previous output
    outputDiv.textContent = "";
    
    const pyodide = await pyodideReadyPromise;
    let totalMarks = 0;
    
    // Set up stdout/stderr redirection
    pyodide.setStdout({
        batched: (s) => outputDiv.textContent += s,
    });
    pyodide.setStderr({
        batched: (s) => outputDiv.textContent += s,
    });
    
    try {
        // Run first test immediately
        try {
            await pyodide.runPythonAsync(pyCode);
            await pyodide.runPythonAsync(tests[0].test);
            totalMarks++;
        } catch (error) {
            outputDiv.textContent += `\n${error}`;
        }
        
        // Run remaining tests asynchronously
        if (tests.length > 1) {
            const remainingTests = tests.slice(1);
            const promises = remainingTests.map(async (test) => {
                try {
                    await pyodide.runPythonAsync(pyCode);
                    await pyodide.runPythonAsync(test.test);
                    totalMarks++;
                } catch (error) {
                    outputDiv.textContent += `\n${error}`;
                }
            });
            
            await Promise.all(promises);
        }
        
        // Show total marks at the end
        outputDiv.textContent += `\nMarks ${totalMarks}/${tests.length}`;
    } catch (error) {
        outputDiv.textContent += `\nError running tests: ${error}`;
    }
}

// Add some styling for test results
const testResultStyle = document.createElement('style');
testResultStyle.textContent += `
    .test-status {
        margin: 10px 0;
        padding: 8px;
        background-color: #f8f9fa;
        border-radius: 4px;
    }
    .test-list {
        margin-top: 10px;
    }
    .test-result {
        margin: 5px 0;
        padding: 5px;
        font-family: monospace;
        white-space: pre-wrap;
    }
`;
document.head.appendChild(testResultStyle);
