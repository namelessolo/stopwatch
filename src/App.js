import React, { useReducer, useEffect, useRef } from "react";
import { Howl } from "howler";

const sound = new Howl({
  src: ["https://namelessolo.github.io/stopwatch/beep.wav"],
  // html5: true,
});

const initialValues = {
  series: "",
  seconds: "",
  initialSeries: null,
  initialSeconds: null,
  isRunning: false,
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
        seconds: state.seconds - 1,
        initialSeries: action.initialSeries,
        initialSeconds: action.initialSeconds,
        isRunning: true,
      };
    case "RUNNING":
      return {
        ...state,
        seconds: action.payload,
      };
    case "OUT_OF_SECONDS":
      sound.play();
      return {
        ...state,
        series: state.series - 1,
        seconds: state.initialSeconds - 1,
      };
    case "OUT_OF_SERIES":
      sound.play();
      return {
        ...initialValues,
        series: state.initialSeries,
        seconds: state.initialSeconds,
      };
    case "PAUSE":
      return {
        ...state,
        isRunning: false,
      };
    case "RESET":
      return initialValues;
    default:
      throw new Error("Unsupported case");
  }
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialValues);
  const { series, seconds, isRunning, initialSeconds, initialSeries } = state;

  const seriesRef = useRef();
  const secondsRef = useRef();

  const inputHandler = (e) => {
    dispatch({ type: "INPUT_CHANGE", field: e.target.id, payload: e.target.value });
  };

  const startHandler = () => {
    dispatch({
      type: "START",
      initialSeries: initialSeries ? initialSeries : seriesRef.current.value,
      initialSeconds: initialSeconds ? initialSeconds : secondsRef.current.value,
    });
  };

  const pauseHandler = () => {
    dispatch({ type: "PAUSE" });
  };

  const resetHandler = () => {
    dispatch({ type: "RESET" });
  };
  useEffect(() => {
    if (isRunning) {
      const timerID = setInterval(() => {
        const remainingTime = seconds - 1;
        if (remainingTime < 0 && series === 1) {
          dispatch({ type: "OUT_OF_SERIES" });
          clearInterval(timerID);
          return;
        }
        if (remainingTime < 0) {
          dispatch({ type: "OUT_OF_SECONDS" });
          sound.play();
          return;
        }
        dispatch({ type: "RUNNING", payload: remainingTime });
      }, 1000);
      return () => clearInterval(timerID);
    }
  }, [isRunning, seconds, series]);
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
          ref={seriesRef}
          className="w-10 h-6 bg-white"
        />
        <label htmlFor="seconds">Seconds</label>
        <input
          type="number"
          id="seconds"
          min="1"
          max="99"
          value={seconds}
          onChange={inputHandler}
          ref={secondsRef}
          className="w-10 h-6 bg-white"
        />
        <div className="w-10 h-6 bg-white"></div>
        <button onClick={startHandler}>START</button>
        <button onClick={pauseHandler}>STOP</button>
        <button onClick={resetHandler}>RESET</button>
      </div>
      <div></div>
    </>
  );
};

export default App;
