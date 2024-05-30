import { useEffect, useMemo, useState } from 'react';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { useLocalStorage } from './useLocalStorage';

const formMakingSteps = [
    "idle",
    "form_title",
    "question_type",
    "question_title",
    "question_description",
    "question_option1",
    "question_option2",
    "question_option3",
    "question_option4",
]

export default function HomeContent(props) {

    const { accessToken, user } = props;

    const [formTitle, setFormTitle] = useState("");

    const [forms, setForms] = useLocalStorage("savedForms", []);

    const [formItems, setFormItems] = useState([]);

    const [textValue, setTextValue] = useState("");

    const [formStep, setFormStep] = useState(formMakingSteps[0]);

    const [options, setOptions] = useState([]);

    const [questionType, setQuestionType] = useState("");

    const [questionTitle, setQuestionTitle] = useState("");

    const [questionDescription, setQuestionDescription] = useState("");

    const [selectedFormId, setSelectedFormId] = useState(undefined);

    const prompt = useMemo(() => {
        switch (formStep) {
            case "idle":
                return "";
            case "form_title":
                return "What is the title of your form?";
            case "question_type":
                return "What type of question do you want to add? open ended or multiple choice";
            case "question_title":
                return "What is the title of your question?";
            case "question_description":
                return "What is the description of your question?";
            case "question_option1":
                return "What is the first option?";
            case "question_option2":
                return "What is the second option?";
            case "question_option3":
                return "What is the third option?";
            case "question_option4":
                return "What is the fourth option?";
            default:
                return "What is the title of your form?";
        }
    }, [formStep]);

    function saveDataToLocalStorage(data) {
        var oldForms = forms;
        if (selectedFormId) {
            oldForms = oldForms.filter(form => form.formId !== selectedFormId);
            setSelectedFormId(undefined);
        }
        if (data.formId) {
            setForms(
                [
                    data,
                    ...oldForms
                ]
            )
        }
    }

    function createForm(name) {

        const url = "https://forms.googleapis.com/v1/forms";

        const body = {
            "info": {
                "title": name,
                "documentTitle": name,
            },
        }

        console.log(body);

        fetch(url, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${accessToken}`
            },
        }).then(response => response.json())
            .then(data => {
                // saveDataToLocalStorage(data);
                console.log(data);

                if (data.formId) {
                    createGoogleForm(data.formId);
                }

            })
            .catch(error => console.log(error));

    }

    const addOpenEndQuestion = (question, description) => {
        const newFormItems = [...formItems];
        newFormItems.push({
            title: question,
            description: description,
            questionItem: {
                question: {
                    required: true,
                    textQuestion: {
                        paragraph: true,
                    },
                },
            },
        });
        setFormItems(newFormItems);
    };

    const addMultipleChoiceQuestion = (question, description, options) => {
        const newFormItems = [...formItems];
        newFormItems.push({
            title: question,
            description: description,
            questionItem: {
                question: {
                    required: true,
                    choiceQuestion: {
                        type: 'Radio',
                        options: options.map((option) => ({
                            value: option,
                        })),
                    },
                },
            },
        });
        setFormItems(newFormItems);
    }

    function createGoogleForm(formId) {

        if (formItems.length === 0) {
            alert("No Items to add");
            return;
        }

        const updateBody = {
            "includeFormInResponse": true,
            "requests": [
                {
                    "createItem": {
                        "item": {
                            "title": "Untitled Question",
                            "description": "Untitled Question",
                            "questionItem": {
                                "question": {
                                    "required": true,
                                    "choiceQuestion": {
                                        "type": "Radio",
                                        "options": [
                                            {
                                                "value": "Option 1",
                                            },
                                            {
                                                "value": "Option 2",
                                            },
                                            {
                                                "value": "Option 3",
                                            },
                                            {
                                                "value": "Option 4",
                                            }
                                        ]
                                    }
                                }
                            }
                        },
                        "location": {
                            "index": 0
                        }
                    },
                },
                {
                    "createItem": {
                        "item": {
                            "title": "Untitled Question",
                            "description": "Untitled Question",
                            "questionItem": {
                                "question": {
                                    "required": true,
                                    "textQuestion": {
                                        "paragraph": true,
                                    }
                                }
                            }
                        },
                        "location": {
                            "index": 1
                        }
                    },
                }
            ]
        }

        // make a new body according to the formItems
        updateBody.requests = [];
        formItems.forEach((item, index) => {
            if (item.questionItem.question.choiceQuestion) {
                updateBody.requests.push({
                    "createItem": {
                        "item": {
                            "title": item.title,
                            "description": item.description,
                            "questionItem": {
                                "question": {
                                    "required": true,
                                    "choiceQuestion": {
                                        "type": "Radio",
                                        "options": item.questionItem.question.choiceQuestion.options
                                    }
                                }
                            }
                        },
                        "location": {
                            "index": index
                        }
                    },
                })
            } else if (item.questionItem.question.textQuestion) {
                updateBody.requests.push({
                    "createItem": {
                        "item": {
                            "title": item.title,
                            "description": item.description,
                            "questionItem": {
                                "question": {
                                    "required": true,
                                    "textQuestion": {
                                        "paragraph": true,
                                    }
                                }
                            }
                        },
                        "location": {
                            "index": index
                        }
                    },
                })
            }
        })

        if (formId) {
            const urlUpdate = `https://forms.googleapis.com/v1/forms/${formId}:batchUpdate`;

            fetch(urlUpdate, {
                method: "POST",
                body: JSON.stringify(updateBody),
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${accessToken}`
                }
            }).then(response => response.json())
                .then(data => {
                    console.log(data);
                    if (data.form) {
                        saveDataToLocalStorage(data.form);
                        alert("Form Created");
                        resetForm();
                    }

                    // saveDataToLocalStorage(data);
                })
                .catch(error => console.log(error));
        }
    }

    function resetForm() {

        setFormTitle("");
        setFormItems([]);
        setFormStep(formMakingSteps[0]);
    }

    const {
        transcript,
        listening,
        resetTranscript,
    } = useSpeechRecognition();

    const startListening = () => SpeechRecognition.startListening({ continuous: true });

    useEffect(() => {
        if (listening) {
            setTextValue(transcript);
        }
    }, [transcript, resetTranscript, listening]);

    function processForm() {
        if (formStep === "idle") {
            if (textValue.trim().includes("create form") || textValue.trim().includes("create new form")) {
                setFormStep(formMakingSteps[1]);
            } else if (textValue.trim().includes("edit form")) {
                if (forms.length === 0) {
                    alert("No forms to edit");
                    return;
                } else {
                    const formName = textValue.trim().split("edit form")[1].trim();
                    const form = forms.find(form => form.info.title.toLowerCase() === formName.toLowerCase());
                    if (form) {
                        // populate the formItems
                        const items = form.items;
                        if (items) {
                            setFormTitle(form.info.title);

                            const newFormItems = [];
                            items.forEach(item => {
                                var itemObj = {

                                }

                                if (item.questionItem.question.choiceQuestion) {
                                    itemObj = {
                                        title: item.title,
                                        description: item.description,
                                        questionItem: {
                                            question: {
                                                required: true,
                                                choiceQuestion: {
                                                    type: 'Radio',
                                                    options: item.questionItem.question.choiceQuestion.options.map(option => ({
                                                        value: option.value,
                                                    })),
                                                },
                                            },
                                        },
                                    }
                                } else if (item.questionItem.question.textQuestion) {
                                    itemObj = {
                                        title: item.title,
                                        description: item.description,
                                        questionItem: {
                                            question: {
                                                required: true,
                                                textQuestion: {
                                                    paragraph: true,
                                                },
                                            },
                                        },
                                    }
                                }

                                newFormItems.push(itemObj);
                            })
                            setFormItems(newFormItems);
                            setFormStep(formMakingSteps[2]);
                            setSelectedFormId(form.formId);
                        }
                    } else {
                        alert(`No form with name ${formName} found`);
                    }
                }
            } else {
                alert("Unknown Command ${textValue}")
                setTextValue("");
            }
        } else if (formStep === "form_title") {
            if (textValue.trim() === "") {
                alert("Please enter a valid title");
                return;
            }
            setFormTitle(textValue);
            setFormStep(formMakingSteps[2]);
        } else if (formStep === "question_type") {
            const questionType = textValue.toLowerCase().trim();
            if (questionType === "open ended") {
                setQuestionType("open ended");
                setFormStep(formMakingSteps[3]);
            } else if (questionType === "multiple choice") {
                setQuestionType("multiple choice");
                setFormStep(formMakingSteps[3]);
            } else {
                alert("Invalid Question Type");
            }
        } else if (formStep === "question_title") {
            if (textValue.trim() === "") {
                alert("Please enter a valid title");
                return;
            }
            setQuestionTitle(textValue);
            setFormStep(formMakingSteps[4]);
        } else if (formStep === "question_description") {
            setQuestionDescription(textValue);
            if (questionType === "open ended") {
                addOpenEndQuestion(questionTitle, questionDescription);
                setFormStep(formMakingSteps[2]);
            } else if (questionType === "multiple choice") {
                setFormStep(formMakingSteps[5]);
            } else {
                alert("Invalid Question Type");
            }
        } else if (formStep === "question_option1") {
            if (textValue.trim() === "") {
                alert("Please enter a valid option");
                return;
            }
            setOptions([...options, textValue]);
            setFormStep(formMakingSteps[6]);
        } else if (formStep === "question_option2") {
            if (textValue.trim() === "") {
                alert("Please enter a valid option");
                return;
            }
            setOptions([...options, textValue]);
            setFormStep(formMakingSteps[7]);
        } else if (formStep === "question_option3") {
            if (textValue.trim() === "") {
                alert("Please enter a valid option");
                return;
            }
            setOptions([...options, textValue]);
            setFormStep(formMakingSteps[8]);
        } else if (formStep === "question_option4") {
            if (textValue.trim() === "") {
                alert("Please enter a valid option");
                return;
            }
            setOptions([...options, textValue]);
            setFormStep(formMakingSteps[9]);
            addMultipleChoiceQuestion(questionTitle, questionDescription, options);
            setFormStep(formMakingSteps[2]);
        }

        setTextValue("");
        resetTranscript();
    }

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                width: "100%",
                padding: "20px",
                justifyContent: "center"
            }}
        >


            <h3>Voice-Enabled Form Making System</h3>

            {
                formTitle && (
                    <h4>Form Title: {formTitle}</h4>
                )
            }

            <div className='flex w-100'>
                <div style={{
                    display: 'flex',
                    width: '100%',
                    flexDirection: 'row',
                }}>
                    <img
                        style={{
                            width: '80px',
                            height: '80px',
                            margin: '4px',
                        }}
                        src={user.picture} alt="User" />
                    <div className='flex flex-col justify-center align-center'>
                        <div
                            style={{
                                color: 'black',
                                fontSize: '20px',
                                fontWeight: 'bold',
                                margin: '10px',
                            }}
                        >{user.name}</div>
                    </div>
                </div>
                <div className='flex-1'>
                    <div>{prompt}</div>
                    <div style={containerStyle}>
                        <input
                            type="text"
                            value={textValue}
                            onChange={(e) => {
                                setTextValue(e.target.value);
                            }}
                            style={searchBarStyle}
                            placeholder=""
                        />
                        <button
                            style={continueButtonStyle}
                            onClick={() => {
                                processForm();
                            }}
                        >
                            Continue
                        </button>
                    </div>
                </div>
                <div
                    style={{
                        cursor: 'pointer',
                    }}
                    onTouchStart={startListening}
                    onMouseDown={startListening}
                    onTouchEnd={SpeechRecognition.stopListening}
                    onMouseUp={SpeechRecognition.stopListening}
                    className='flex flex-col justify-center align-center'>
                    <img
                        style={{
                            width: '80px',
                            height: '80px',
                            margin: '4px',
                        }}
                        src='https://www.iconpacks.net/icons/1/free-microphone-icon-342-thumb.png' alt='mic' />
                    <button
                        style={{
                            width: '150px',
                        }}

                    >{listening ? "Listening" : "Hold to speak"}</button>
                </div>
            </div>

            {
                formStep == "idle" && (
                    <button
                        onClick={() => {
                            setFormStep(formMakingSteps[1]);
                        }}
                    >Create New Form +</button>
                )
            }

            {
                formItems.length > 0 && (
                    <button
                        onClick={() => {
                            createForm(formTitle);
                        }}
                    >Update Current Form</button>
                )
            }

            {/* <div
            >
                <p>Microphone: {listening ? 'on' : 'off'}</p>
                <button onClick={SpeechRecognition.startListening}>Start</button>
                <button onClick={SpeechRecognition.stopListening}>Stop</button>
                <button onClick={resetTranscript}>Reset</button>
                <p>{transcript}</p>
            </div> */}


            <div
                style={{
                    overflowX: "scroll",
                    display: "flex",
                    marginTop: "20px",
                    width: "100%"

                }}
            >
                {
                    forms.map(form => (
                        <div
                            style={{
                                border: "1px solid black",
                                minWidth: "300px",
                                padding: "10px",
                                margin: "10px",
                                color: "black",
                            }}
                            key={form.formId}>
                            <div>{form.info.title}</div>
                            <a href={form.responderUri} target='_blank'>Open Form</a>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    // populate the formItems
                                    const items = form.items;
                                    if (items) {
                                        setFormTitle(form.info.title);

                                        const newFormItems = [];
                                        items.forEach(item => {
                                            var itemObj = {

                                            }

                                            if (item.questionItem.question.choiceQuestion) {
                                                itemObj = {
                                                    title: item.title,
                                                    description: item.description,
                                                    questionItem: {
                                                        question: {
                                                            required: true,
                                                            choiceQuestion: {
                                                                type: 'Radio',
                                                                options: item.questionItem.question.choiceQuestion.options.map(option => ({
                                                                    value: option.value,
                                                                })),
                                                            },
                                                        },
                                                    },
                                                }
                                            } else if (item.questionItem.question.textQuestion) {
                                                itemObj = {
                                                    title: item.title,
                                                    description: item.description,
                                                    questionItem: {
                                                        question: {
                                                            required: true,
                                                            textQuestion: {
                                                                paragraph: true,
                                                            },
                                                        },
                                                    },
                                                }
                                            }

                                            newFormItems.push(itemObj);
                                        })
                                        setFormItems(newFormItems);
                                        setFormStep(formMakingSteps[2]);
                                        setSelectedFormId(form.formId);
                                    }
                                }}
                            >
                                Edit Form
                            </button>
                        </div>
                    ))
                }
            </div>


            <div>
                {formItems.map((item, index) => (
                    <div key={index}>
                        <div
                            style={{
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                padding: "10px",
                                borderRadius: "10px",
                                marginTop: "20px",
                                marginBottom: "20px",
                            }}
                        >
                            <h2
                                style={{
                                    flex: 1,
                                }}
                            >{item.title}</h2>
                            <button
                                onClick={() => {
                                    // reomve the item from the formItems
                                    const newFormItems = [...formItems];
                                    newFormItems.splice(index, 1);
                                    setFormItems(newFormItems);
                                }}
                            >Remove</button>
                        </div>
                        <p>{item.description}</p>
                        {/* Render different input fields based on the item's structure */}
                        {item.questionItem.question.choiceQuestion ? (
                            <div>
                                <p>Options:</p>
                                {item.questionItem.question.choiceQuestion.options.map((option, optionIndex) => (
                                    <div key={optionIndex}>
                                        <input type="radio" name={`question_${index}`} value={option.value} />
                                        <label>{option.value}</label>
                                    </div>
                                ))}
                            </div>
                        ) : item.questionItem.question.textQuestion ? (
                            <textarea rows="4" cols="50" placeholder="Enter your answer"></textarea>
                        ) : null}
                    </div>
                ))}
            </div>

            <div
                style={{
                    width: "100%",
                    padding: "20px",
                    backgroundColor: "#FBCDCD"
                }}
            >
                <ul>
                    <li>Click "Create New Form" or the Microphone icon on the top right to start creating form.</li>
                    <li>Voice Commands: </li>
                    <ol>
                        <li>create form - To start creating form.</li>
                        <li>edit form [Form Name] - Replace Form Name with name of the form you wish to edit.</li>
                        <li>open form [Form Name] - Replace Form Name with name of the form you wish to open.</li>
                    </ol>
                    <li>Follow system prompts to complete form related actions.</li>
                    <li>Use voice commands or manually typed to input data.</li>
                </ul>

            </div>

        </div>
    )
}

const containerStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    padding: '20px',
    backgroundColor: '#f0f0f0',
};

const searchBarStyle = {
    flex: 1,
    padding: '10px',
    border: '1px solid #ccc',
    borderRadius: '4px',
    marginRight: '10px',
};

const continueButtonStyle = {
    padding: '10px 20px',
    backgroundColor: '#007bff',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
};

function FormView(props) {
    const form = props.form;
    return (
        <div
            style={{
                display: "flex",
                marginTop: "20px",
                width: "100%"
            }}
        >
            <div>{form.info.title}</div>

        </div>
    )
}