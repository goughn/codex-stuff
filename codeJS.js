var pyodideReadyPromise = loadPyodide();
console.log("type 106 github vB7.2");
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
  console.log("=== STARTING runPython2 EXECUTION ===");
  var pyodide = await pyodideReadyPromise;
  await pyodide.loadPackage("numpy");
  await pyodide.loadPackage("matplotlib");

    itemInstance = button.closest(".itemInstance");
    instanceID = itemInstance.getAttribute("id");
    pyCode = itemInstance.querySelector(".answer").value;
    
    console.log("=== EXECUTION SETUP ===");
    console.log("Instance ID:", instanceID);
    console.log("User's Python code:", pyCode);

  // Look for tests in the problem div
  let problemDiv = itemInstance.querySelector(".problem");
  let tests = [];
  let testOutputs = [];
  
  console.log("=== TEST DETECTION ===");
  console.log("Problem div found:", !!problemDiv);
  console.log("Problem div element:", problemDiv);
  
  if (problemDiv) {
    console.log("Problem div attributes:", problemDiv.attributes);
    console.log("Problem div has data-tests:", problemDiv.hasAttribute('data-tests'));
    console.log("Problem div innerHTML:", problemDiv.innerHTML.substring(0, 200) + "...");
  }
  
  // Search for tests in multiple possible locations
  console.log("=== SEARCHING FOR TESTS IN MULTIPLE LOCATIONS ===");
  
  // 1. Check problem div for data-tests
  if (problemDiv && problemDiv.hasAttribute('data-tests')) {
    console.log("Found data-tests in problem div");
    try {
      let rawTests = JSON.parse(problemDiv.getAttribute('data-tests'));
      console.log("Successfully parsed tests from problem div:", rawTests);
      
      // Convert to simple test format with just inputs
      tests = rawTests.map((test, index) => {
        console.log(`Processing test ${index + 1}:`, test);
        
        return {
          id: index + 1,
          description: `Test ${index + 1}: ${JSON.stringify(test.input)}`,
          input: test.input,
          expectedOutput: test.output
        };
      });
      
      console.log("Processed tests:", tests);
    } catch (e) {
      console.error("Could not parse data-tests from problem div:", e);
    }
  }
  
  // 2. Check if tests are in a separate element
  let testElements = itemInstance.querySelectorAll('[data-tests]');
  console.log("Elements with data-tests attribute:", testElements.length);
  testElements.forEach((el, index) => {
    console.log(`Element ${index} with data-tests:`, el);
    console.log(`Element ${index} data-tests value:`, el.getAttribute('data-tests'));
    
    // If we haven't found tests yet, try to parse from this element
    if (tests.length === 0) {
      try {
        let rawTests = JSON.parse(el.getAttribute('data-tests'));
        console.log(`Successfully parsed tests from element ${index}:`, rawTests);
        
        // Convert to simple test format with just inputs
        tests = rawTests.map((test, testIndex) => {
          console.log(`Processing test ${testIndex + 1}:`, test);
          
          return {
            id: testIndex + 1,
            description: `Test ${testIndex + 1}: ${JSON.stringify(test.input)}`,
            input: test.input,
            expectedOutput: test.output
          };
        });
        
        console.log("Processed tests from element:", tests);
      } catch (e) {
        console.error(`Could not parse data-tests from element ${index}:`, e);
      }
    }
  });
  
  // 3. Check if tests are in a script tag
  let scriptElements = itemInstance.querySelectorAll('script');
  console.log("Script elements found:", scriptElements.length);
  scriptElements.forEach((script, index) => {
    console.log(`Script ${index} content:`, script.textContent.substring(0, 100) + "...");
  });
  
  // 4. Check if tests are in the itemInstance itself
  console.log("itemInstance attributes:", itemInstance.attributes);
  if (itemInstance.hasAttribute('data-tests')) {
    console.log("Found data-tests on itemInstance itself");
    try {
      tests = JSON.parse(itemInstance.getAttribute('data-tests'));
      console.log("Successfully parsed tests from itemInstance:", tests);
    } catch (e) {
      console.error("Could not parse data-tests from itemInstance:", e);
    }
  }
  
  // 5. Check if tests are in the form element
  let formElement = itemInstance.querySelector('form');
  if (formElement) {
    console.log("Form element found:", formElement);
    console.log("Form attributes:", formElement.attributes);
    if (formElement.hasAttribute('data-tests')) {
      console.log("Found data-tests on form element");
      try {
        tests = JSON.parse(formElement.getAttribute('data-tests'));
        console.log("Successfully parsed tests from form:", tests);
      } catch (e) {
        console.error("Could not parse data-tests from form:", e);
      }
    }
  }
  
  console.log("=== FINAL TEST DETECTION RESULT ===");
  console.log("Number of tests found:", tests.length);
  console.log("Tests array:", tests);

  // Redirige stdout
  let outputDiv = document.getElementById("o" + instanceID);
  console.log("Output div found:", !!outputDiv, "ID:", "o" + instanceID);
  outputDiv.textContent = "";

  pyodide.setStdout({
    batched: (s) => outputDiv.textContent += s,
  });

  pyodide.setStderr({
    batched: (s) => outputDiv.textContent += s,
  });

  try {
    console.log("=== RUNNING USER CODE ===");
    // First, run the user's code to define functions
    await pyodide.runPythonAsync(pyCode);
    console.log("User code executed successfully");
    
    if (tests.length > 0) {
      console.log("=== RUNNING TESTS ===");
      console.log("Total tests to run:", tests.length);
      
      // Run first test and show output
      let firstTest = tests[0];
      console.log("Running first test:", firstTest);
      outputDiv.textContent += `\n=== Running Test 1: ${firstTest.description} ===\n`;
      
      // Run user's function with first test input
      let firstOutput = await runTestWithInput(pyodide, firstTest.input);
      console.log("First test output captured:", firstOutput);
      outputDiv.textContent += firstOutput + "\n";
      testOutputs.push(firstOutput);
      
      // Run remaining tests silently
      console.log("=== RUNNING REMAINING TESTS SILENTLY ===");
      for (let i = 1; i < tests.length; i++) {
        let test = tests[i];
        console.log(`Running test ${i+1}:`, test.description);
        
        let output = await runTestWithInput(pyodide, test.input);
        console.log(`Test ${i+1} output:`, output);
        testOutputs.push(output);
      }
      
      console.log("=== ALL TESTS COMPLETED ===");
      console.log("Final test outputs array:", testOutputs);
      console.log("Number of outputs collected:", testOutputs.length);
      
      // Store test outputs for saveAnswer_106
      itemInstance.testOutputs = testOutputs;
      console.log("Test outputs stored on itemInstance:", itemInstance.testOutputs);
      
    } else {
      console.log("No tests found, running code normally");
    }
    
  } catch (err) {
    console.error("Error during execution:", err);
    outputDiv.textContent += "\n" + err;
  }
  
  console.log("=== runPython2 EXECUTION COMPLETE ===");
}

// Helper function to run test code and capture output
async function runTestAndCaptureOutput(pyodide, testCode) {
  console.log("=== runTestAndCaptureOutput START ===");
  console.log("Test code to execute:", testCode);
  
  let capturedOutput = "";
  
  // Temporarily redirect stdout to capture test output
  let originalStdout = pyodide.runPython("import sys; sys.stdout");
  console.log("Original stdout captured");
  
  pyodide.setStdout({
    batched: (s) => {
      capturedOutput += s;
      console.log("Captured output chunk:", s);
    },
  });
  
  try {
    console.log("Executing test code...");
    await pyodide.runPythonAsync(testCode);
    console.log("Test code executed successfully");
    
    // If no output was printed, try to get the result value
    if (capturedOutput.trim() === "") {
      console.log("No output captured, checking for 'result' variable");
      let result = pyodide.runPython(`
try:
    result
except NameError:
    "No result"
`);
      capturedOutput = result ? result.toString() : "No output";
      console.log("Result variable value:", result);
    }
    
  } catch (err) {
    console.error("Error during test execution:", err);
    capturedOutput = "Error: " + err.toString();
  }
  
  // Restore original stdout behavior
  pyodide.setStdout({
    batched: (s) => {
      let outputDiv = document.getElementById("o" + document.querySelector(".itemInstance").id);
      if (outputDiv) outputDiv.textContent += s;
    },
  });
  
  console.log("Final captured output:", capturedOutput.trim());
  console.log("=== runTestAndCaptureOutput END ===");
  
  return capturedOutput.trim();
}

async function runTestWithInput(pyodide, input) {
  console.log("=== STARTING runTestWithInput ===");
  console.log("Input for test:", input);

  let capturedOutput = "";

  // Temporarily redirect stdout to capture test output
  let originalStdout = pyodide.runPython("import sys; sys.stdout");
  console.log("Original stdout captured");

  pyodide.setStdout({
    batched: (s) => {
      capturedOutput += s;
      console.log("Captured output chunk:", s);
    },
  });

  try {
    console.log("Executing test with input...");
    
    // Call the user's function with the test input
    let testCode;
    if (Array.isArray(input)) {
      // If input is an array, pass as separate arguments
      let args = input.map(arg => JSON.stringify(arg)).join(', ');
      testCode = `result = batuketa(${args})`;
    } else {
      // If input is a single value
      testCode = `result = batuketa(${JSON.stringify(input)})`;
    }
    
    console.log("Test code to execute:", testCode);
    await pyodide.runPythonAsync(testCode);
    console.log("Test with input executed successfully");
    
    // Get the result value
    let result = pyodide.runPython("result");
    capturedOutput = result ? result.toString() : "No output";
    console.log("Result value:", result);
    
  } catch (err) {
    console.error("Error during test with input:", err);
    capturedOutput = "Error: " + err.toString();
  }

  // Restore original stdout behavior
  pyodide.setStdout({
    batched: (s) => {
      let outputDiv = document.getElementById("o" + document.querySelector(".itemInstance").id);
      if (outputDiv) outputDiv.textContent += s;
    },
  });

  console.log("Final captured output:", capturedOutput);
  console.log("=== runTestWithInput COMPLETE ===");
  return capturedOutput;
}

function saveAnswer_106(button) {
    console.log("=== saveAnswer_106 CALLED ===");
    itemInstance = button.closest(".itemInstance");
    pyCode = itemInstance.querySelector(".answer").value;

    console.log("saveAnswer_106 called, itemInstance.id:", itemInstance.id);
    console.log("Looking for output div with id:", "o" + itemInstance.id);
    console.log("User's code:", pyCode);
    
    // Debug: Check if itemInstance has testOutputs property
    console.log("itemInstance.testOutputs exists:", itemInstance.hasOwnProperty('testOutputs'));
    console.log("itemInstance.testOutputs value:", itemInstance.testOutputs);
    console.log("All itemInstance properties:", Object.keys(itemInstance));

    let outputArray = [];

    // Use test outputs array if available, otherwise fall back to single output
    if (itemInstance.testOutputs && itemInstance.testOutputs.length > 0) {
        console.log("=== USING TEST OUTPUTS ARRAY ===");
        console.log("Test outputs found on itemInstance:", itemInstance.testOutputs);
        console.log("Number of test outputs:", itemInstance.testOutputs.length);
        console.log("Test outputs array contents:");
        itemInstance.testOutputs.forEach((output, index) => {
            console.log(`  Test ${index + 1}: "${output}"`);
        });
        
        outputArray = itemInstance.testOutputs;
        console.log("Using test outputs array:", outputArray);
    } else {
        console.log("=== USING FALLBACK SINGLE OUTPUT ===");
        console.log("No testOutputs found - this means tests weren't run or stored properly");
        
        // Fallback to original behavior if no tests were run
        let outputDiv = document.getElementById("o" + itemInstance.id);
        if (outputDiv) {
            let output = outputDiv.textContent;
            outputArray = [output]; // Convert single output to array
            console.log("No test outputs found, using single output as array:", outputArray);
        } else {
            console.warn("Output div not found, using empty array");
            console.warn("Available elements with 'o' prefix:", 
                Array.from(document.querySelectorAll('[id^="o"]')).map(el => el.id));
            outputArray = [""]; // Empty array
        }
    }
    
    console.log("=== FINAL OUTPUT ARRAY ===");
    console.log("Output array:", outputArray);
    console.log("Output array type:", typeof outputArray);
    console.log("Output array is array:", Array.isArray(outputArray));
    
    resp = JSON.stringify(outputArray);
    console.log("=== FINAL JSON SENT TO SERVER ===");
    console.log("JSON string:", resp);
    console.log("JSON length:", resp.length);
    
    return resp;
}
