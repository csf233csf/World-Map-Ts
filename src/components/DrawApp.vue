<template>
  <div class="background">
    <div class="draw-app">
      <button class="close-button" @click="closeDrawApp">
        <img src="/images/close1.svg" alt="Close Icon" class="svg-icon" />
      </button>
      <div class="canvascontainer">
        <p class="stroked-text">Draw your aliens</p>
        <canvas ref="canvas" :width="canvasSize" :height="canvasSize"></canvas>
        <div class="toolbar">
          <button @click="setEraser">
            <img src="/images/eraser1.svg" alt="Eraser" />
          </button>
          <button @click="setPen">
            <img src="/images/pencil.svg" style="padding:5px" alt="Pen" />
          </button>
          <button class="colorbutton" @click="changePenColor('#FF00F5')" style="background-color: #FF00F5;">
          </button>
          <button class="colorbutton" @click="changePenColor('#00FFFF')" style="background-color: #00FFFF;">
          </button>
          <button class="colorbutton" @click="changePenColor('#FFF72E')" style="background-color: #FFF72E;">
          </button>
          <button class="colorbutton" @click="changePenColor('#52FF00')" style="background-color: #52FF00;">
          </button>
        </div>
      </div>
      <div class="input">
        <p class="stroked-text">Story input</p>
        <textarea v-model="story" placeholder="Write your story here..."></textarea>
        <button class="uploadbutton" @click="saveDrawing" :disabled="isUploading">Post</button>
        <div v-if="isUploading" class="spinner"></div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { watch, ref, onMounted } from 'vue';
import { getStorage, ref as storageRef, uploadString, getDownloadURL } from 'firebase/storage';
import { getDatabase, ref as dbRef, set } from 'firebase/database';

const props = defineProps<{ xPos: number; yPos: number }>();
const canvas = ref<HTMLCanvasElement | null>(null);
const ctx = ref<CanvasRenderingContext2D | null>(null);
const penColor = ref('#FF00F5');
const pixelSize = ref(10);
const isUploading = ref(false);
const canvasSize = 500;
const story = ref('');
const emit = defineEmits(['close']);
let drawing = false;

const setEraser = () => {
  if (ctx.value) {
    ctx.value.globalCompositeOperation = 'destination-out';
  }
};

const setPen = () => {
  if (ctx.value) {
    ctx.value.globalCompositeOperation = 'source-over';
    ctx.value.strokeStyle = penColor.value;
  }
};

const startDrawing = (event: MouseEvent) => {
  if (ctx.value) {
    drawing = true;
    ctx.value.beginPath();
    ctx.value.moveTo(event.offsetX, event.offsetY);
    draw(event);
  }
};

const stopDrawing = () => {
  if (ctx.value) {
    drawing = false;
    ctx.value.closePath();
  }
};

const changePenColor = (color: string) => {
  penColor.value = color;
  if (ctx.value) {
    ctx.value.strokeStyle = penColor.value;
  }
};

const draw = (event: MouseEvent) => {
  if (!drawing) return;
  if (ctx.value) {
    ctx.value.lineTo(event.offsetX, event.offsetY);
    ctx.value.stroke();
  }
};

const saveDrawing = async () => {
  if (canvas.value) {
    isUploading.value = true;
    const dataUrl = canvas.value.toDataURL();
    const storage = getStorage();
    const imageRef = storageRef(storage, `${props.xPos}_${props.yPos}.png`);
    await uploadString(imageRef, dataUrl, 'data_url');
    const url = await getDownloadURL(imageRef);

    const db = getDatabase();
    const imageDbRef = dbRef(db, `images_map/${props.xPos}_${props.yPos}`);
    await set(imageDbRef, { xPos: props.xPos, yPos: props.yPos, url, story: story.value });
    closeDrawApp();
    alert('Drawing saved!');
    isUploading.value = false;
  }
};

const clearCanvas = () => {
  if (ctx.value && canvas.value) {
    ctx.value.clearRect(0, 0, canvas.value.width, canvas.value.height);
  }
};

const closeDrawApp = () => {
  clearCanvas();
  ctx.value = null;
  canvas.value = null;
  isUploading.value = false;
  emit('close');
};

onMounted(() => {
  if (canvas.value) {
    ctx.value = canvas.value.getContext('2d');
    ctx.value!.strokeStyle = penColor.value;
    ctx.value!.lineWidth = pixelSize.value;
    canvas.value.addEventListener('mousedown', startDrawing);
    canvas.value.addEventListener('mouseup', stopDrawing);
    canvas.value.addEventListener('mouseleave', stopDrawing);
    canvas.value.addEventListener('mousemove', draw);
  }
});

watch(penColor, (newColor) => {
  if (ctx.value) {
    ctx.value.strokeStyle = newColor;
  }
});

watch(pixelSize, (newSize) => {
  if (ctx.value) {
    ctx.value.lineWidth = newSize;
  }
});
</script>


<style scoped>
.background {
  position: absolute;
  top: 0px;
  left: 0px;
  width: 100vw;
  height: 100vh;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
}

.draw-app {
  position: relative;
  height: 650px; 
  width: 900px;
  padding: 10px;
  border: 2px solid #00ffffa3;
  box-shadow: 0px 0px 10px rgb(0, 255, 255);
  /* box-shadow: 0 0 8px rgb(0, 255, 255); */
  z-index: 1000;
  border-radius: 10px;;
  /* filter: blur(1px); */
  background-color: black;
  /* background-image: url('/images/canvascontain.svg'); */
  background-size: contain;
  display: flex;
  flex-direction: row;
}
.canvascontainer{
  margin: 30px;
  
}
canvas {
  /* border: 1px solid black; */
  background-image: url('/images/canvasbg.svg');
  background-size: contain;
}

.toolbar {
  display: flex;
  position: relative;
  align-items: center;
}

.spinner {
  border: 4px solid rgba(0, 0, 0, 0.1);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border-left-color: #09f;
  animation: spin 1s ease infinite;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}

.eraserbutton {
  top: 20px;
  right: 0;
  height: 60px;
  width: 60px;
  margin-right: 3%;
  border-radius: 50%;
  flex-shrink: 0;
  min-width: 32px;
  background-color: #FFF72E;
  font-size: 9px;
  letter-spacing: 0.5px;
  color: black;
  min-height: 60px;
  z-index: 1020;
}

button {
  height:40px;
  width: 40px;
  border-radius: 50%;
  margin-left: 30px;
  /* background-color: #FFF72E; */
}

.colorbutton{
  height:30px;
  width: 30px;
  border-radius: 50%;
  filter: blur(1px);
}

button img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: blur(0.5px);
}


.stroked-text {
  font-size: 18spx;
  color: #00FFFF;
  font-weight: 700;
  margin-bottom: 10px;
  text-shadow: 
    -1px -1px 0 #FF00F5,  
    1px -1px 0 #FF00F5,
    -1px 1px 0 #FF00F5,
    1px 1px 0 #FF00F5;
}


.input {
  height: 100%;
  width: 300px;
  background-color:transparent;
  display: flex;
  flex-direction: column;
  /* align-items:end; */
  justify-content: end;
  gap: 10px;
  padding-bottom: 30px;
}


textarea{
  width: 100%;
  height:100px;
  padding: 5px;
  background-color: #000000;
  border: 2px solid #00ffff;
  border-radius: 8px;
  box-shadow: 0 0 8px rgb(0, 255, 255);
  color: rgb(9, 140, 255);
  margin-bottom: 10px;
}

.uploadbutton{
  width:100px;
  font-size: 15px;
  height:30px;
  border-radius: 20px;
  background-color: #00FFFF;
  color: #FF00C7;
  font-weight: 600;
  box-shadow: 0 0 8px rgb(0, 255, 255);
  margin-left: 200px;
}

.close-button {
  position: absolute;
  top: 6px;
  right:6px;
  background: transparent;
  border: none;
  border-radius: 50%;
  width: 25px;
  height: 25px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1010;
  transition: opacity 0.3s; /* 添加透明度变化的过渡效果 */
  opacity: 0.7;
}

.close-button:hover {
  opacity: 0.3;
}


.close-button img.svg-icon {
  margin-right: 8px;
  width: 15px;  /* 调整SVG图标宽度 */
  height: 15px; /* 调整SVG图标高度 */
  
}

</style>