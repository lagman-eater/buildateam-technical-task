const canvas = new fabric.Canvas("canvas", {
  width: 800,
  height: 600,
  backgroundColor: "#e9ecef",
});
canvas.preserveObjectStacking = true;

let currentShape = null;
let activeIcon = null;

const circleBtn = document.getElementById("circle-btn");
const squareBtn = document.getElementById("square-btn");
const triangleBtn = document.getElementById("triangle-btn");
const shapeColorPicker = document.getElementById("shape-color");
const iconColorPicker = document.getElementById("icon-color");

const iconStarBtn = document.getElementById("icon-star");
const iconUmbrellaBtn = document.getElementById("icon-umbrella");
const iconTriangleBtn = document.getElementById("icon-triangle");

const scaleInput = document.getElementById("scale-input");
const downloadPngBtn = document.getElementById("download-png");
const downloadSvgBtn = document.getElementById("download-svg");

function addShape(type) {
  if (currentShape) {
    canvas.remove(currentShape);
    currentShape = null;
  }

  const color = shapeColorPicker.value;
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  const size = Math.min(canvasWidth, canvasHeight) * 0.7;

  let shape;
  switch (type) {
    case "circle":
      shape = new fabric.Circle({
        radius: size / 2,
        fill: color,
        left: (canvasWidth - size) / 2,
        top: (canvasHeight - size) / 2,
        selectable: false,
      });
      break;
    case "square":
      shape = new fabric.Rect({
        width: size,
        height: size,
        fill: color,
        left: (canvasWidth - size) / 2,
        top: (canvasHeight - size) / 2,
        selectable: false,
      });
      break;
    case "triangle":
      shape = new fabric.Triangle({
        width: size,
        height: size * 0.9,
        fill: color,
        left: (canvasWidth - size) / 2,
        top: (canvasHeight - size * 0.9) / 2,
        selectable: false,
      });
      break;
  }

  currentShape = shape;
  canvas.add(shape);
  canvas.sendToBack(shape);
  canvas.renderAll();
}

circleBtn.addEventListener("click", () => addShape("circle"));
squareBtn.addEventListener("click", () => addShape("square"));
triangleBtn.addEventListener("click", () => addShape("triangle"));

shapeColorPicker.addEventListener("input", (e) => {
  if (currentShape) {
    currentShape.set("fill", e.target.value);
    canvas.renderAll();
  }
});

function addIcon(iconPath) {
  fabric.loadSVGFromURL(iconPath, (objects, options) => {
    let icon =
      objects.length === 1
        ? objects[0]
        : fabric.util.groupSVGElements(objects, options);

    icon.scale(5);
    icon.set("fill", iconColorPicker.value);

    if (currentShape) {
      const bounds = currentShape.getBoundingRect();
      icon.left = bounds.left + bounds.width / 2 + (Math.random() * 100 - 50);
      icon.top = bounds.top + bounds.height / 2 + (Math.random() * 100 - 50);
    } else {
      icon.left = canvas.width / 2;
      icon.top = canvas.height / 2;
    }

    icon.selectable = true;
    icon.hasControls = true;
    icon.hasBorders = true;
    icon.hoverCursor = "pointer";

    canvas.add(icon);
    canvas.bringToFront(icon);
    canvas.setActiveObject(icon);
    activeIcon = icon;
    canvas.renderAll();
  });
}

iconStarBtn.addEventListener("click", () => addIcon("assets/icons/star.svg"));
iconUmbrellaBtn.addEventListener("click", () =>
  addIcon("assets/icons/umbrella.svg")
);
iconTriangleBtn.addEventListener("click", () =>
  addIcon("assets/icons/triangle.svg")
);

iconColorPicker.addEventListener("input", (e) => {
  const active = canvas.getActiveObject();
  if (active && active !== currentShape) {
    if (active.type === "group") {
      active.getObjects().forEach((obj) => obj.set("fill", e.target.value));
    } else {
      active.set("fill", e.target.value);
    }
    canvas.renderAll();
  }
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Delete" || e.key === "Del") {
    const active = canvas.getActiveObject();
    if (active && active !== currentShape) {
      canvas.remove(active);
      activeIcon = null;
      canvas.discardActiveObject();
      canvas.renderAll();
    }
  }

  if (e.ctrlKey && e.key.toLowerCase() === "d") {
    e.preventDefault();
    const active = canvas.getActiveObject();
    if (active && active !== currentShape) {
      active.clone((cloned) => {
        cloned.set({
          left: active.left + 30,
          top: active.top + 30,
        });
        canvas.add(cloned);
        canvas.setActiveObject(cloned);
        canvas.renderAll();
      });
    }
  }
});

function downloadCanvas(format = "png", scale = 1) {
  const multiplier = isNaN(scale) || scale <= 0 ? 1 : scale;

  if (format === "svg") {
    const svgData = canvas.toSVG();
    const blob = new Blob([svgData], { type: "image/svg+xml" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = "canvas.svg";
    link.click();
  } else {
    const dataURL = canvas.toDataURL({
      format: "png",
      multiplier,
    });
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = "canvas.png";
    link.click();
  }
}

downloadPngBtn.addEventListener("click", () => {
  const scale = parseFloat(scaleInput.value) || 1;
  downloadCanvas("png", scale);
});

downloadSvgBtn.addEventListener("click", () => downloadCanvas("svg"));
