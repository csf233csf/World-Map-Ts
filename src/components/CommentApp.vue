<template>
  <div class="comment-app">
    <div class="image-container">
      <img :src="imageUrl || ''" alt="Image" />
    </div>
    <div class="comment-container">
    <p class="stroked-text">Story</p>
    <div class="comments">
      <p>  {{ story }}</p>
    </div>
    <p class="stroked-text" style="margin-top: 20px;">Comment</p>
    <div class="comments">
      <div v-for="(comment, index) in comments" :key="index" class="comment">
        <p>{{ comment }}</p>
      </div>
    </div>
    <textarea v-model="newComment" placeholder="Add a comment..."></textarea>
    <button class="uploadbutton" @click="addComment">Post</button>
    <button @click="closeCommentApp" class="close-button">
      <img src="/images/close1.svg" alt="Close Icon" class="svg-icon" />
    </button>
  </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, onMounted } from 'vue';
import { ref as dbRef, push, onValue } from 'firebase/database';
import { database } from '../firebaseConfig';

const props = defineProps<{ xPos: number; yPos: number }>();
const emit = defineEmits(['close']);

const newComment = ref('');
const comments = ref<string[]>([]);
const imageUrl = ref<string | null>(null);
const story = ref<string | null>(null);

onMounted(() => {
  const imageRef = dbRef(database, `images_map/${props.xPos}_${props.yPos}`);
  onValue(imageRef, (snapshot) => {
    const data = snapshot.val();
    if (data) {
      if (data.url) {
        imageUrl.value = data.url;
      }
      if (data.story) {
        story.value = data.story;
      }
    }
  });

  const commentsRef = dbRef(database, `comment_map/${props.xPos}_${props.yPos}`);
  onValue(commentsRef, (snapshot) => {
    comments.value = [];
    snapshot.forEach((childSnapshot) => {
      const comment = childSnapshot.val();
      comments.value.push(comment);
    });
  });
});

const closeCommentApp = () => {
  emit('close');
};

const addComment = async () => {
  if (newComment.value.trim() !== '') {
    const commentsRef = dbRef(database, `comment_map/${props.xPos}_${props.yPos}`);
    await push(commentsRef, newComment.value.trim());
    newComment.value = '';
  }
};
</script>

<style scoped>
.comment-app {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgb(0, 0, 0);
  padding: 20px;
  border: 2px solid #00ffffa3;
  box-shadow: 0px 0px 10px rgb(0, 255, 255);
  z-index: 1000;
  /* width: 500px; */
  display: flex;
  flex-direction: row;
  
}
.image-container{

  background-image: url('/images/canvasbg.svg');
  background-size: contain;
  margin-right: 20px;
}
.image-container img {
  width: 400px;
}
.comment-container{
position: relative;
width:400px;

}
.story {
  margin-top: 10px;
  /* font-style: italic; */
  color:#00FFFF;  
}

.comments {
  height: 100px;
  overflow-y: scroll;
  margin-top: 10px;
  color:#00FFFF;
}

.comments::-webkit-scrollbar {
  width: 12px; /* 宽度 */
  background: transparent; /* 滚动条背景色 */
}

/* 滚动条滑块样式 */
.comments::-webkit-scrollbar-thumb {
  background-color: #00FFFF; /* 滑块颜色 */
  border-radius: 10px; /* 圆角 */
  border: 3px solid #000000; /* 滑块周围的边框 */
  min-height: 10px;
}

/* 滚动条滑块在悬停时的样式 */
.comments::-webkit-scrollbar-thumb:hover {
  background-color: #00CED1; /* 悬停时滑块颜色 */
}

/* 滚动条轨道样式 */
.comments::-webkit-scrollbar-track {
  background-color: #000000; /* 轨道颜色 */
  border-radius: 10px; /* 圆角 */
}

/* 滚动条轨道在悬停时的样式 */
.comments::-webkit-scrollbar-track:hover {
  background-color: #444; /* 悬停时轨道颜色 */
}

.comment {
  padding: 5px;
  border-bottom: 0.5px solid #FF00F5;
}

textarea {
  width: 100%;
  height: 60px;
  margin-top: 10px;
  margin-bottom: 10px;
  color:#00FFFF;
}

.button {
  margin-top: 10px;
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
  /* margin-left: 200px; */
  left:300px;
  position: relative;

}

textarea{
  width: 100%;
  height:80px;
  padding: 5px;
  background-color: #000000;
  border: 2px solid #00ffff;
  border-radius: 8px;
  box-shadow: 0 0 8px rgb(0, 255, 255);
  margin-bottom: 10px;
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

.close-button {
  position: absolute;
  top: 0px;
  right:0px;
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
