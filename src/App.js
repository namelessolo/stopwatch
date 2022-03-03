import React, { useEffect, useRef, useReducer } from "react";

function App() {
  const initialValues = {
    series: "",
    seconds: "",
    hundredOfSeconds: 0,
    isRunning: false,
    initialSeconds: null,
    initialSeries: null,
    now: null,
  };

  const reducer = (state, action) => {
    switch (action.type) {
      case "INPUT_CHANGE":
        return {
          ...state,
          [action.field]: action.payload,
        };
      case "START":
        return {
          ...state,
          isRunning: true,
          initialSeconds: action.initialSeconds,
          initialSeries: action.initialSeries,
          now: action.now,
          seconds: state.seconds--,
        };
      case "RUNNING":
        return {
          ...state,
          seconds: Math.floor(action.payload / 1000),
          hundredOfSeconds: String(Math.floor(action.payload / 10)).slice(-2),
        };
      case "OUT_OF_SERIES":
        return {
          ...initialValues,
          seconds: state.initialSeconds,
          series: state.initialSeries,
        };

      case "OUT_OF_SECONDS":
        return {
          ...state,
          seconds: state.initialSeconds - 1,
          series: state.series - 1,
          now: Date.now(),
        };
      default:
        throw new Error("Unsupported case");
    }
  };

  const [state, dispatch] = useReducer(reducer, initialValues);
  const { series, seconds, hundredOfSeconds, isRunning, initialSeconds, now } = state;
  const secondsRef = useRef();
  const seriesRef = useRef();

  const inputHandler = (e) => {
    dispatch({ type: "INPUT_CHANGE", field: e.target.id, payload: e.target.value });
  };

  const startHandler = () => {
    dispatch({
      type: "START",
      initialSeconds: secondsRef.current.value,
      initialSeries: seriesRef.current.value,
      now: Date.now(),
    });
  };

  useEffect(() => {
    if (isRunning) {
      const timerId = setInterval(() => {
        const remainingHundredOfSeconds = initialSeconds * 1000 + now - Date.now();
        if (remainingHundredOfSeconds <= 0 && series === 1) {
          dispatch({ type: "OUT_OF_SERIES" });
          clearInterval(timerId);
          return;
        }
        if (remainingHundredOfSeconds <= 0) {
          dispatch({ type: "OUT_OF_SECONDS" });
        }

        dispatch({ type: "RUNNING", payload: remainingHundredOfSeconds });
      }, 10);
      return () => clearInterval(timerId);
    }
  }, [isRunning, initialSeconds, now, series]);

  return (
    <>
      <div className="flex flex-col bg-teal-500 max-w-xl aspect-square rounded-full justify-center items-center mx-auto">
        <label htmlFor="series">Series</label>
        <input
          type="number"
          id="series"
          min="1"
          max="99"
          maxLength="2"
          value={series}
          onChange={inputHandler}
          className="w-6 h-6 bg-white"
          ref={seriesRef}
        />
        <label htmlFor="seconds">Seconds</label>
        <input
          type="number"
          id="seconds"
          min="1"
          max="99"
          value={seconds}
          onChange={inputHandler}
          className="w-6 h-6 bg-white"
          ref={secondsRef}
        />
        <div>ELO</div>
        <div className="w-6 h-6 bg-white">{hundredOfSeconds}</div>
        <button onClick={startHandler}>START</button>
        <button>STOP</button>
        <button>RESET</button>
      </div>
      <div></div>
    </>
  );
}

export default App;
