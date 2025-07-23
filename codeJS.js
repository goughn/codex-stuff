var pyodideReadyPromise = loadPyodide();
console.log("type 106 github vB1.5");
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
    console.log("=== DETAILED instanceObj INSPECTION ===");
    console.log("File NoteBookInstance_Pyodide.js");
    console.log("id: " + instanceObj.iid);
    
    // Store instanceObj for later use in runPython2
    itemInstance.instanceObjData = instanceObj;
    
    // Thorough debugging - log all properties of instanceObj
    console.log("=== COMPLETE instanceObj DUMP ===");
    console.log("Raw instanceObj:", instanceObj);
    
    // Log each property individually
    for (let key in instanceObj) {
        if (instanceObj.hasOwnProperty(key)) {
            console.log(`instanceObj.${key}:`, instanceObj[key]);
            
            // If it looks like JSON, try to parse and log it
            if (typeof instanceObj[key] === 'string' && 
                (instanceObj[key].startsWith('{') || instanceObj[key].startsWith('['))) {
                try {
                    let parsed = JSON.parse(instanceObj[key]);
                    console.log(`instanceObj.${key} PARSED:`, parsed);
                } catch (e) {
                    console.log(`instanceObj.${key} - Not valid JSON`);
                }
            }
        }
    }
    
    // Check for common evaluation/input patterns
    let potentialInputKeys = ['evaluation', 'input', 'inputs', 'testCases', 'tests', 'data'];
    potentialInputKeys.forEach(key => {
        if (instanceObj[key]) {
            console.log(`*** FOUND POTENTIAL INPUT DATA in ${key}:`, instanceObj[key]);
        }
    });
    
    console.log("=== END instanceObj INSPECTION ===");
    
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
  //var code = document.getElementById("python-code").value;

    itemInstance = button.closest(".itemInstance");
    instanceID = itemInstance.getAttribute("id");
    pyCode = itemInstance.querySelector(".answer").value;
    
    console.log("=== PRE-EXECUTION ANALYSIS ===");
    console.log("Instance ID:", instanceID);
    console.log("Python code to execute:", pyCode);
    
    // Access stored instanceObj data
    let instanceObjData = itemInstance.instanceObjData;
    console.log("Stored instanceObjData:", instanceObjData);
    
    // Look for input data in various possible locations
    let inputData = null;
    let inputSource = null;
    
    if (instanceObjData) {
      console.log("=== SEARCHING FOR INPUT DATA ===");
      
      // Check for evaluation data
      if (instanceObjData.evaluation) {
        console.log("Found evaluation property:", instanceObjData.evaluation);
        try {
          let evalData = JSON.parse(instanceObjData.evaluation);
          console.log("Parsed evaluation data:", evalData);
          if (Array.isArray(evalData) && evalData.length > 0 && evalData[0].input) {
            inputData = evalData[0].input;
            inputSource = "evaluation[0].input";
            console.log("*** USING INPUT FROM EVALUATION:", inputData);
          }
        } catch (e) {
          console.log("Could not parse evaluation as JSON:", e);
        }
      }
      
      // Check other possible input sources
      ['input', 'inputs', 'testData', 'data'].forEach(key => {
        if (!inputData && instanceObjData[key]) {
          console.log(`Found ${key} property:`, instanceObjData[key]);
          inputData = instanceObjData[key];
          inputSource = key;
          console.log(`*** USING INPUT FROM ${key}:`, inputData);
        }
      });
    }

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
    if (inputData) {
      console.log(`=== EXECUTING WITH INPUT INJECTION (source: ${inputSource}) ===`);
      outputDiv.textContent += `[DEBUG] Input data found from ${inputSource}: ${inputData}\n`;
      outputDiv.textContent += `[DEBUG] Injecting input into Python environment\n\n`;
      
      // Inject input data into Python environment
      pyodide.globals.set("input_data", inputData);
      
      // Create a modified version of the code that can access input_data
      let modifiedCode = `
# Input data injected from ${inputSource}
print(f"Input data: {input_data}")

# User's original code:
${pyCode}
`;
      console.log("Modified code with input injection:", modifiedCode);
      await pyodide.runPythonAsync(modifiedCode);
    } else {
      console.log("=== EXECUTING WITHOUT INPUT INJECTION ===");
      outputDiv.textContent += "[DEBUG] No input data found in instanceObj - executing code as-is\n\n";
      await pyodide.runPythonAsync(pyCode);
    }
  } catch (err) {
    console.error("Python execution error:", err);
    outputDiv.textContent += "\n" + err;
  }
  
  console.log("=== runPython2 EXECUTION COMPLETE ===");
}

function saveAnswer_106(button) {
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
