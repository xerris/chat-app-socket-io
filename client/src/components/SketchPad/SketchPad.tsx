import { useContext, useEffect, useState } from "react";
import Sketch from "react-p5";
import p5Types from "p5";
import { SocketContext } from "../SocketContext";

interface Props {}

const SketchPad: React.FC<Props> = ({}) => {
  const socket = useContext(SocketContext);
  const [color, setColor] = useState("#1362b0");
  const [strokeWidth, setStrokeWidth] = useState(10);

  const sendMouse = (x, y, pX, pY) => {
    const data = {
      x: x,
      y: y,
      px: pX,
      py: pY,
      color,
      strokeWidth
    };

    if (socket) {
      socket.emit("mouse", data);
    }
  };
  //See annotations in JS for more information
  const setup = (p5: p5Types, canvasParentRef: Element) => {
    const cnv = p5.createCanvas(1000, 500).parent(canvasParentRef);
    cnv.mousePressed((event) => {});
    p5.mouseDragged = (event: any) => {
      const { pageX, pageY, x, y } = event;
      sendMouse(x, y, pageX, pageY);
    };
  };

  useEffect(() => {
    if (socket) {
      socket.emit("join", {
        username: "alex"
      });
    }
  });

  const draw = (p5: p5Types) => {
    p5.background(1);
    // p5.ellipse(x, y, 70, 70);
    // p5.line(40, 60, 80, 200);
    if (socket) {
      socket.on("mouse", (data) => {
        if (data.color) {
          p5.stroke(data.color);
          p5.strokeWeight(data.strokeWidth);
          p5.line(data.x, data.y, data.px, data.py);
        }
      });
    }
  };

  return <Sketch setup={setup} draw={draw} />;
};

export default SketchPad;
