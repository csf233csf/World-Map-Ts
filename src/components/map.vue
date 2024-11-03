<template>
  <div class='bg'>
    <div class="map-container" @click.self="openDrawPage">
      <!-- Draw App modal -->
      <div v-if="showDrawApp">
        <DrawApp :xPos="xPos" :yPos="yPos" @close="closeDrawApp" />
        <div class="overlay"></div>
      </div>

      <!-- Comment App modal -->
      <div v-if="showCommentApp" class="comment-app">
        <CommentApp :xPos="selectedXPos" :yPos="selectedYPos" @close="closeCommentApp" />
        <div class="overlay"></div>
      </div>

      <!-- Image button elements -->
      <div v-for="(img, index) in images" :key="index" class="image-button"
        :style="{ left: img.xPos + 'px', top: img.yPos + 'px' }">
        <button @click.stop="openCommentApp(img.xPos, img.yPos)" @mouseover="showImage(img.url, $event)"
          @mouseleave="hideImage">
        </button>
      </div>

      <!-- Hovered image display -->
      <div v-if="hoveredImage" class="hover-image" :style="{ top: hoverY + 'px', left: hoverX + 'px' }">
        <img :src="hoveredImage" alt="Hover Preview" width="200" height="200" />
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { database } from '../firebaseConfig';
import { ref as dbRef, onValue } from 'firebase/database';
import DrawApp from './DrawApp.vue';
import CommentApp from './CommentApp.vue';

const xPos = ref(0);
const yPos = ref(0);
const showDrawApp = ref(false);
const showCommentApp = ref(false);
const selectedXPos = ref<number | null>(null);
const selectedYPos = ref<number | null>(null);
const hoveredImage = ref<string | null>(null);
const hoverX = ref(0);
const hoverY = ref(0);

const images = ref<{ xPos: number; yPos: number; url: string }[]>([]);

const showImage = (url: string, event: MouseEvent) => {
  hoveredImage.value = url;
  const buttonRect = (event.target as HTMLElement).getBoundingClientRect();
  hoverX.value = buttonRect.left + window.scrollX - 100;
  hoverY.value = buttonRect.top + window.scrollY - 100;
};

const hideImage = () => {
  hoveredImage.value = null;
};

const openDrawPage = (event: MouseEvent) => {
  xPos.value = event.offsetX;
  yPos.value = event.offsetY;
  showDrawApp.value = true;
};

const closeDrawApp = () => {
  showDrawApp.value = false;
};

const openCommentApp = (x: number, y: number) => {
  selectedXPos.value = x;
  selectedYPos.value = y;
  showCommentApp.value = true;
};

const closeCommentApp = () => {
  showCommentApp.value = false;
  selectedXPos.value = null;
  selectedYPos.value = null;
};

onMounted(() => {
  const imagesRef = dbRef(database, 'images_map');
  onValue(imagesRef, (snapshot) => {
    images.value = [];
    snapshot.forEach((childSnapshot) => {
      const data = childSnapshot.val();
      images.value.push({
        xPos: data.xPos,
        yPos: data.yPos,
        url: data.url
      });
    });
  });
});
</script>

<style scoped>
.map-container {
  width: 100vw;
  height: 100vh;
  position: relative;
  background-image: url('/map.svg');
  background-size: cover;
  background-position: center;
  overflow: hidden;
}

/* Button markers on the map */
.image-button {
  position: absolute;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: rgba(255, 255, 255, 0.8);
  border: 2px solid rgba(0, 204, 255, 0.8);
  border-radius: 50%;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  cursor: pointer;
  transition: transform 0.1s ease;
}

.image-button button {
  width: 100%;
  height: 100%;
  background: none;
  border: none;
  cursor: pointer;
}

.image-button:hover {
  transform: scale(1.1);
  /* Slight scale on hover */
}

/* Hovered image styling */
.hover-image {
  position: absolute;
  z-index: 7;
  padding: 5px;
  background-color: #222;
  border: 1px solid rgba(255, 255, 255, 0.8);
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  pointer-events: none;
}

.hover-image img {
  display: block;
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
  border-radius: 5px;
}

/* Overlay for modal background */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
}

/* Comment and Draw App Modal styling */
.comment-app {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1000;
}
</style>
