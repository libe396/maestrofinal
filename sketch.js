let appScreen = "main";
let maestroImg, musicBgImg, centerImg;
const songData = { 'D/G': [], 'Bm7': [], 'Em11': [], 'D': [] };
const scales = {
  'D/G': ['G5', 'D5', 'A4', 'F#4', 'D4', 'G3'],
  'Bm7': ['D5', 'B4', 'A4', 'F#4', 'D4', 'B3'],
  'Em11': ['A5', 'F#5', 'D5', 'B4', 'G4', 'E4'],
  'D': ['D5', 'A4', 'F#4', 'D4', 'A3', 'F#3']
};
const orderOfChords = ['D/G', 'Bm7', 'Em11', 'D'];
let currentScreen = 'selectChord', currentProgression = '', notes = [];
const numSteps = 16;
let synth, mainSequence;
let isPlaying = false, isPlaylistPlaying = false;
let playlistParts = [];
let currentStep = -1;
let gridArea = {}, playButton = {}, resetButton = {}, saveButton = {},
    backButton = {}, finalPlayButton = {}, finalProgressBar = {}, extraBackButton = {};
let stepWidth, pitchHeight;

function preload() {
  maestroImg = loadImage("main.png");
  musicBgImg = loadImage("bgImg.png");
  centerImg  = loadImage("center.png");
}

function setup() {
  createCanvas(1920, 1080);
  synth = new Tone.PolySynth(Tone.Synth, { oscillator: {type:'fmsine'}, envelope: {attack:0.1, decay:0.1, sustain:0.5, release:0.8} }).toDestination();
  Tone.Transport.bpm.value = 140;
  const steps = Array.from(Array(numSteps).keys());
  mainSequence = new Tone.Sequence((time, step) => {
    currentStep = step;
    const notesToPlay = notes.filter(note => note.step === step);
    if (notesToPlay.length > 0) synth.triggerAttackRelease(notesToPlay.map(n => n.pitch), '8n', time);
  }, steps, '8n').start(0);
  Tone.Transport.loop = true;
  Tone.Transport.loopStart = 0;
  Tone.Transport.loopEnd = '2m';
}

function draw() {
  if (appScreen === "main")      drawLandingScreen();
  else if (appScreen === "info") drawIntroScreen();
  else if (appScreen === "music")drawMusicScreens();
}

function drawLandingScreen() {
  image(maestroImg, 0, 0, width, height);
  drawStartButton(width - 250, height - 160, 170, 60);
}
function drawStartButton(x, y, w, h) {
  noStroke(); fill(255,30);
  rect(x, y, w, h, 30);
  textSize(33); fill(255); textStyle(BOLD);
  textAlign(CENTER, CENTER); text("START", x + w / 2, y + h / 2);
}
function drawIntroScreen() {
  image(centerImg, 0, 0, width, height);
  fill(255, 230); textAlign(CENTER, CENTER);
  textSize(24); text("이제부터 당신은 마에스트로예요.", width / 2, height / 2 - 40);
  textSize(24); text("앞에 비치된 헤드폰을 끼고, 원하는 멜로디를 마음껏 만들어봐요.", width / 2, height / 2 - 5);
  textSize(24); fill("#BCBCBC");
  text("From now on, you are the maestro.", width / 2, height / 2 + 40);
  textSize(24); fill("#BCBCBC");
  text("Put on the headphones in front of you and feel free to create any melody you desire!", width / 2, height / 2 + 75);
  drawNextButton(width - 250, height - 160, 170, 60);
}
function drawNextButton(x, y, w, h) {
  noStroke(); fill(255,30);
  rect(x, y, w, h, 30);
  textSize(33); fill(255); textAlign(CENTER, CENTER); text("NEXT", x + w / 2, y + h / 2);
}
function drawMusicScreens() {
  image(musicBgImg, 0, 0, width, height);
  if (currentScreen === 'selectChord')        drawChordSelectionScreen();
  else if (currentScreen === 'createMelody')  drawMelodyCreationScreen();
  else if (currentScreen === 'finalListen')   drawFinalListenScreen();
}
function drawChordSelectionScreen() {
  image(centerImg, 0, 0, width, height);
  let centerY = height / 2 - 120;
  fill('#FFFFFF'); textSize(24); textAlign(CENTER, TOP); textStyle(BOLD);
  text("작업하고 싶은 코드를 골라볼까요?", width/2, centerY - 120);
  textSize(22); fill("#BCBCBC"); text("Let's choose the code we want to work on.", width/2, centerY - 85);
  const codeW = 260, codeH = 110, gap = 55, totalW = codeW*4+gap*3;
  const startX = (width-totalW)/2;
  let y = centerY;
  let btnSize = 80, cx = width/2, cy = centerY + 380;
  for(let i=0;i<4;i++) {
    let x = startX + i*(codeW+gap);
    let hasMelody = songData[orderOfChords[i]].length > 0;
    if(hasMelody) {
      fill("#FF3700"); noStroke();
      rect(x, y, codeW, codeH, 25);
      fill(255); textSize(33);
    } else {
      noFill(); stroke("#FF3700"); strokeWeight(3);
      rect(x, y, codeW, codeH, 25);
      fill(140); textSize(33);
    }
    noStroke();
    textAlign(CENTER, CENTER);
    text(orderOfChords[i], x+codeW/2, y+codeH+40);
  }
  fill(255); textSize(28); textAlign(CENTER, CENTER); textStyle(BOLD);
  text("최종 곡 듣기", cx, cy - 80);
  drawRedPlayButton(cx, cy, btnSize);
}
function drawRedPlayButton(cx, cy, radius) {
  push();
  noStroke();
  fill("#FF3700");
  ellipse(cx, cy, radius, radius);
  fill(255);
  let l=radius*0.47;
  let x0 = cx-radius*0.10, y0 = cy-l/2.6;
  let x1 = cx-radius*0.10, y1 = cy+l/2.6;
  let x2 = cx+radius*0.16, y2 = cy;
  triangle(x0, y0, x0, y1, x2, y2);
  pop();
}
function handleMouseOnChordScreen() {
  let centerY = height / 2 - 120;
  const codeW = 260, codeH = 110, gap = 55, totalW = codeW*4 + gap*3;
  const startX = (width-totalW)/2;
  let y = centerY;
  for(let i=0;i<4;i++) {
    let x = startX + i*(codeW+gap);
    if(mouseX > x && mouseX < x+codeW && mouseY > y && mouseY < y+codeH) {
      currentProgression = orderOfChords[i];
      notes = [...songData[orderOfChords[i]]];
      mainSequence.mute = false;
      Tone.Transport.bpm.value = 140; Tone.Transport.loop = true;
      currentScreen = 'createMelody'; return;
    }
  }
  let btnSize = 80, cx = width/2, cy = centerY + 380;
  if(dist(mouseX, mouseY, cx, cy) < btnSize/2) {
    currentScreen = 'finalListen'; return;
  }
}
function drawMelodyCreationScreen() {
  const currentScale = scales[currentProgression], numPitches = currentScale.length;
  const sideMargin = 127, headerHeight = 355, footerHeight = 238;
  gridArea = {x:sideMargin, y:headerHeight, width:width-sideMargin*2, height:height-headerHeight-footerHeight};
  stepWidth = gridArea.width / numSteps;
  pitchHeight = gridArea.height / numPitches;
  playButton = {x:width-sideMargin-350, y:gridArea.y+gridArea.height+85, w:162, h:61};
  resetButton = {x:playButton.x+playButton.w+24, y:playButton.y, w:162, h:61};
  let btnLabel = '저장하고 돌아가기';
  let tw = textWidth(btnLabel);
  let btnPadding = 24;
  let btnW = tw + btnPadding, btnH = 60;
  saveButton = {x:width-127-btnW, y:95, w:btnW, h:btnH};
  progressBar = {x:sideMargin, y:playButton.y+23, w:gridArea.width-playButton.w*2-220, h:18};
  drawMelodyHeader();
  drawGrid(currentScale, numPitches);
  drawNotes();
  if(isPlaying) drawPlaybackBar();
  drawMelodyFooter();
}
function handleMouseOnMelodyScreen() {
  if(mouseX > saveButton.x && mouseX < saveButton.x + saveButton.w &&
     mouseY > saveButton.y && mouseY < saveButton.y + saveButton.h) {
    songData[currentProgression] = [...notes]; currentScreen = 'selectChord';
    if(isPlaying) togglePlayPause();
    return;
  }
  if(mouseX > resetButton.x && mouseX < resetButton.x + resetButton.w &&
     mouseY > resetButton.y && mouseY < resetButton.y + resetButton.h) {
    resetSequencer(); return;
  }
  if(mouseX > playButton.x && mouseX < playButton.x + playButton.w &&
     mouseY > playButton.y && mouseY < playButton.y + playButton.h) {
    Tone.Transport.bpm.value = 140;
    togglePlayPause(); return;
  }
  if(mouseX > gridArea.x && mouseX < gridArea.x + gridArea.width &&
     mouseY > gridArea.y && mouseY < gridArea.y + gridArea.height){
    if(Tone.context.state!=="running") Tone.start();
    const step=Math.floor((mouseX-gridArea.x)/stepWidth), pitchIndex=Math.floor((mouseY-gridArea.y)/pitchHeight);
    const existingNoteIndex=notes.findIndex(note=>note.step===step&&note.pitchIndex===pitchIndex);
    if(existingNoteIndex>-1){notes.splice(existingNoteIndex,1);}
    else{
      const pitch=scales[currentProgression][pitchIndex];
      notes.push({x:gridArea.x+step*stepWidth+stepWidth/2,y:gridArea.y+pitchIndex*pitchHeight+pitchHeight/2,pitch:pitch,step:step,pitchIndex:pitchIndex});
      synth.triggerAttackRelease(pitch,'8n');
    }
  }
}
function drawMelodyHeader() {
  fill(255); noStroke(); textAlign(LEFT,CENTER); textSize(28);
  text(`Current Chord: ${currentProgression}`,127,250);
  fill(100,200,100,180);
  rect(saveButton.x,saveButton.y,saveButton.w,saveButton.h,14);
  fill(255); textSize(22); textAlign(CENTER,CENTER);
  text('저장하고 돌아가기',saveButton.x+saveButton.w/2,saveButton.y+saveButton.h/2);
}
function drawGrid(currentScale,numPitches){
  stroke(255,50);strokeWeight(1);for(let i=0;i<=numSteps;i++)line(gridArea.x+i*stepWidth,gridArea.y,gridArea.x+i*stepWidth,gridArea.y+gridArea.height);
  for(let i=0;i<=numPitches;i++)line(gridArea.x,gridArea.y+i*pitchHeight,gridArea.x+gridArea.width,gridArea.y+i*pitchHeight);
  stroke(255,100);strokeWeight(3);for(let i=1;i<numSteps/4;i++){const x=gridArea.x+i*(stepWidth*4);line(x,gridArea.y,x,gridArea.y+gridArea.height);}
  noStroke();fill(255,150);textAlign(CENTER,BOTTOM);textSize(18);for(let i=0;i<numSteps/4;i++)text(i+1,gridArea.x+i*(stepWidth*4)+(stepWidth*2),gridArea.y-10);
  textAlign(RIGHT,CENTER);textSize(20);for(let i=0;i<numPitches;i++)text(currentScale[i],gridArea.x-20,gridArea.y+i*pitchHeight+pitchHeight/2);
}
function drawNotes(){for(const note of notes){fill('#ff3700');noStroke();ellipse(note.x,note.y,stepWidth*0.7);}}
function drawMelodyFooter() {
  noStroke();fill(255,50);rect(progressBar.x,progressBar.y,progressBar.w,progressBar.h,10);
  if(isPlaying){
    let progress = Tone.Transport.seconds / Tone.Time('2m').toSeconds();
    fill('#FF3700');
    rect(progressBar.x, progressBar.y, progressBar.w * progress, progressBar.h, 10);
  }
  fill(isPlaying?'#9F93DF':'#FF3700');noStroke();rect(playButton.x,playButton.y,playButton.w,playButton.h,60);
  fill(255);textAlign(CENTER,CENTER);textSize(32);textStyle(BOLD);
  text(isPlaying?'stop':'start',playButton.x+playButton.w/2,playButton.y+playButton.h/2);
  stroke(255);strokeWeight(2);noFill();rect(resetButton.x,resetButton.y,resetButton.w,resetButton.h,60);
  fill(255);text('reset',resetButton.x+resetButton.w/2,resetButton.y+resetButton.h/2);
}
function drawPlaybackBar() {
  // 진행 중인 step(재생 위치) 그리드에 하얀 세로 재생바(불투명도 60, 자연스럽게)
  fill(255,255,255,60);
  noStroke();
  rect(gridArea.x+currentStep*stepWidth, gridArea.y, stepWidth, gridArea.height);
}
// ---- 최종 감상 ----
function drawFinalListenScreen() {
  const sideMargin = 127;
  const gridWidth = width - sideMargin*2;
  const gridH = 380;
  const codeTitleH = 50;
  const verticalCenter = height/2;
  // 그리드 30px 아래로, 버튼은 50px 위로(진행바도 50 위로)
  const gridY = verticalCenter - (codeTitleH + gridH + 70 + 125)/2 + codeTitleH + 30;
  const gridX = sideMargin;
  const finalGridArea = {x: gridX, y: gridY, w: gridWidth, h: gridH};
  drawFinalCodeGrid(finalGridArea);
  drawMelodyDotsOnCodeGridWithPitch(finalGridArea);
  backButton = {x: width-270, y: 95, w: 150, h: 60};
  fill(220); noStroke(); rect(backButton.x, backButton.y, backButton.w, backButton.h, 18);
  fill(40); textSize(24); textAlign(CENTER, CENTER); text('← 코드로', backButton.x+backButton.w/2, backButton.y+backButton.h/2);
  finalProgressBar = {x: gridX, y: gridY + gridH + 55, w: gridWidth, h: 30};
  drawFinalListenFooter();
  if(isPlaylistPlaying) drawFinalPlaybackBar(finalGridArea);
}
function handleMouseOnFinalListenScreen() {
  if(mouseX>finalProgressBar.x&&mouseX<finalProgressBar.x+finalProgressBar.w&&mouseY>finalProgressBar.y&&mouseY<finalProgressBar.y+finalProgressBar.h){
    let xRatio = (mouseX-finalProgressBar.x)/finalProgressBar.w;
    let totalDuration = Tone.Time('4m').toSeconds() * orderOfChords.length;
    let targetTime = xRatio*totalDuration;
    isPlaylistPlaying=false;
    playEntireSong(targetTime);
    return;
  }
  if(mouseX>backButton.x&&mouseX<backButton.x+backButton.w&&mouseY>backButton.y&&mouseY<backButton.y+backButton.h){
    stopAllMusic(); currentScreen='selectChord'; return;
  }
  if(mouseX>finalPlayButton.x&&mouseX<finalPlayButton.x+finalPlayButton.w&&mouseY>finalPlayButton.y&&mouseY<finalPlayButton.y+finalPlayButton.h){
    if(isPlaylistPlaying) stopAllMusic();
    else playEntireSong();
    return;
  }
  if(mouseX>extraBackButton.x&&mouseX<extraBackButton.x+extraBackButton.w&&mouseY>extraBackButton.y&&mouseY<extraBackButton.y+extraBackButton.h){
    stopAllMusic(); appScreen="main";
  }
}
function drawFinalCodeGrid(area) {
  const partWidth=area.w/orderOfChords.length;
  noStroke();fill(255);textSize(32);textAlign(CENTER,BOTTOM);textStyle(BOLD);
  for(let i=0;i<orderOfChords.length;i++){
    const x=area.x+(i+0.5)*partWidth;
    text(orderOfChords[i],x,area.y-20);
  }
  stroke(255,120);strokeWeight(5);
  for(let i=0;i<=orderOfChords.length;i++){
    const x=area.x+i*partWidth;line(x,area.y,x,area.y+area.h);
  }
}
function drawMelodyDotsOnCodeGridWithPitch(area){
  const partWidth=area.w/orderOfChords.length;
  for(let i=0;i<orderOfChords.length;i++){
    const progression=orderOfChords[i], partNotes=songData[progression];
    const scale = scales[progression]; const numPitches = scale.length;
    for(const note of partNotes){
      const pitchIdx = scale.findIndex(p=>p===note.pitch);
      const noteX = area.x+i*partWidth+(note.step+0.5)*(partWidth/numSteps);
      const noteY = area.y + 16 + (area.h-32)*(pitchIdx+0.5)/numPitches;
      fill('#ff3700');noStroke();
      ellipse(noteX, noteY, partWidth/numSteps*0.9);
    }
  }
}
function drawFinalPlaybackBar(area) {
  const totalDuration = Tone.Time('4m').toSeconds() * orderOfChords.length;
  const progress = Tone.Transport.seconds / totalDuration;
  const x = area.x + area.w * progress;
  fill(255,255,255,60);
  noStroke();
  rect(x-2, area.y+20, 4, area.h-40);
}
function drawFinalListenFooter(){
  let btnW=180, btnH=70, gap=60; let cy = finalProgressBar.y + finalProgressBar.h + 55;
  finalPlayButton = {x: width/2-btnW-gap/2, y: cy, w: btnW, h: btnH};
  extraBackButton = {x: width/2+gap/2, y: cy, w: btnW, h: btnH};
  fill(isPlaylistPlaying?'#9F93DF':'#FF3700');
  rect(finalPlayButton.x, finalPlayButton.y, btnW, btnH, 25);
  fill(255); textSize(32); textStyle(BOLD); textAlign(CENTER, CENTER);
  text(isPlaylistPlaying?'stop':'start', finalPlayButton.x+btnW/2, finalPlayButton.y+btnH/2);
  fill(200,200,200,240);
  rect(extraBackButton.x, extraBackButton.y, btnW, btnH, 25);
  fill(50); textSize(32); textAlign(CENTER, CENTER);
  text("home", extraBackButton.x+btnW/2, extraBackButton.y+btnH/2);
  const totalDuration = Tone.Time('4m').toSeconds() * orderOfChords.length;
  const progress = totalDuration > 0 ? Tone.Transport.seconds / totalDuration : 0;
  noStroke(); fill(255, 50);
  rect(finalProgressBar.x, finalProgressBar.y, finalProgressBar.w, finalProgressBar.h, 10);
  if(isPlaylistPlaying) {
    fill('#FF3700');
    rect(finalProgressBar.x, finalProgressBar.y, finalProgressBar.w*progress, finalProgressBar.h, 10);
  }
}
function playEntireSong(startAtSec=0) {
  Tone.Transport.bpm.value = 240;
  Tone.Transport.cancel(); playlistParts && playlistParts.forEach(part=>part.dispose());
  playlistParts = []; mainSequence.mute = true; Tone.Transport.loop = false;
  Tone.Transport.position = startAtSec;
  for(let i=0;i<orderOfChords.length;i++) {
    const progression = orderOfChords[i]; const partNotes = songData[progression];
    if(partNotes.length > 0) {
      partNotes.forEach(note => {
        let blockStart = Tone.Time(`${i*4}m`).toSeconds();
        let stepTime = Tone.Time(`${Math.floor(note.step/4)}:${note.step%4}`).toSeconds();
        let absTime = blockStart + stepTime;
        Tone.Transport.schedule((time) => {
          synth.triggerAttackRelease(note.pitch, '8n', time);
        }, absTime);
      });
    }
  }
  const totalDuration = Tone.Time('4m').toSeconds() * orderOfChords.length;
  Tone.Transport.scheduleOnce(() => { isPlaylistPlaying = false; Tone.Transport.stop(); }, totalDuration + 0.1);
  if (Tone.context.state !== 'running') Tone.start();
  Tone.Transport.start(undefined, startAtSec);
  isPlaylistPlaying = true;
}
function stopAllMusic() {
  Tone.Transport.cancel();
  Tone.Transport.stop();
  isPlaylistPlaying = false;
}
function togglePlayPause() {
  if (isPlaying) { Tone.Transport.pause(); isPlaying = false; }
  else { if (Tone.context.state !== 'running') Tone.start(); Tone.Transport.start(); isPlaying = true; }
}
function resetSequencer() {
  notes = [];
  if (isPlaying) togglePlayPause();
  Tone.Transport.position = 0; currentStep = -1;
}
function mousePressed() {
  if (appScreen === "main") {
    let x = width - 250, y = height - 160, w = 170, h = 60;
    if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) appScreen = "info";
  }
  else if (appScreen === "info") {
    let x = width - 250, y = height - 160, w = 170, h = 60;
    if (mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h) {
      appScreen="music"; currentScreen='selectChord';
    }
  }
  else if (appScreen === "music") {
    if (currentScreen === 'selectChord') handleMouseOnChordScreen();
    else if (currentScreen === 'createMelody') handleMouseOnMelodyScreen();
    else if (currentScreen === 'finalListen') handleMouseOnFinalListenScreen();
  }
}
