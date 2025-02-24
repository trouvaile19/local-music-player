        /**
         * 1. Render songs
         * 2. Scroll top
         * 3. Play / pause / seek
         * 4. CD rotate
         * 5. Next / prev
         * 6. Random
         * 7. Next / Repeat when ended
         * 8. Active song
         * 9. Scroll active song into view
         * 10. Play song when click
         */
        
        const $ = document.querySelector.bind(document)
        const $$ = document.querySelectorAll.bind(document)

        const PLAYER_STORAGE_KEY = 'MUSIC_PLAYER'
    
        const heading = $('header h2')
        const cdThumb = $('.cd-thumb')
    
        const audio = $('#audio')
        const playBtn = $('.btn-toggle-play')
        const player = $('.player')
        const progress = $('#progress')
        const nextBtn = $('.btn-next')
        const prevBtn = $('.btn-prev')
        const randomBtn = $('.btn-random')
        const repeatBtn = $('.btn-repeat')
        const volumeControl = $('.volume-control') 
        const volumeProgress = $('.volume-progress')
        
        const loudVolIcon = $('.loud-vol');
        const lowVolIcon = $('.low-vol');
        const muteVolIcon = $('.mute-vol');
        

        const app = 
        {
            isPlaying: false,  
            isRandom: false,
            isRepeat: false,
            config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY) ||'{}'),

            currentIndex: 0,
            songs:
            [
                {
                    name: 'Dừng chân, đứng lại',
                    singer: 'NamLee, Tofu, An ft VoVanDuc',
                    image: './asset/img/song1.jpg',
                    path: './asset/music/song1.mp3'
                },
                {
                    name: 'Chưa được yêu như thế',
                    singer: 'Trang',
                    image: './asset/img/song2.jpg',
                    path: './asset/music/song2.mp3'
                },
                {
                    name: 'Qua những tiếng ve',
                    singer: 'Tofu, Urabe ft Xesi',
                    image: './asset/img/song3.jpg',
                    path: './asset/music/song3.mp3'
                },
                {
                    name: 'Một thuở thanh bình',
                    singer: 'Tùng Tea ft Tuyết',
                    image: './asset/img/song4.jpg',
                    path: './asset/music/song4.mp3'
                },
                {
                    name: 'Em không',
                    singer: 'Vũ Thanh Vân',
                    image: './asset/img/song5.jpg',
                    path: './asset/music/song5.mp3'
                },
                {
                    name: 'Một ngàn nỗi đau (live)',
                    singer: 'Mai Văn Hương X Trung Quân',
                    image: './asset/img/song6.jpg',
                    path: './asset/music/song6.mp3'
                },
                {
                    name: 'Từng là của nhau',
                    singer: 'Bảo Anh ft Táo',
                    image: './asset/img/song7.jpg',
                    path: './asset/music/song7.mp3'
                },
                {
                    name: 'Cầu Vĩnh Tuy',
                    singer: 'Wren Evans',
                    image: './asset/img/song8.jpg',
                    path: './asset/music/song8.mp3'
                },
                {
                    name: 'Only',
                    singer: 'LeeHi',
                    image: './asset/img/song9.jpg',
                    path: './asset/music/song9.mp3'
                },
                {
                    name: 'Cô đơn trên sofa (live)',
                    singer: 'Trung Quân',
                    image: './asset/img/song10.jpg',
                    path: './asset/music/song10.mp3'
                }
            ],
            setConfig: function(key, value){
                this.config[key] = value;
                localStorage.setItem(PLAYER_STORAGE_KEY, JSON.stringify(this.config))
            },
            render: function(){
                const html = this.songs.map((song, index) =>(
                    `<div class="song ${index === this.currentIndex ? 'active':''}">
                        <div class="thumb" style="background-image: url(${song.image})">
                        </div>
                        <div class="body">
                            <h3 class="title">${song.name}</h3>
                            <p class="author">${song.singer}</p>
                        </div>
                        <div class="option">
                            <i class="fas fa-ellipsis-h"></i>
                        </div>
                    </div>`
                )).join('')
                
                $('.playlist').innerHTML = html;    
            },
            
             
            defineProperties: function(){
                Object.defineProperty(this, 'currentSong', {
                    get: function(){
                        return this.songs[this.currentIndex];
                    }
                })
            },
            handleEvent: function(){
                const cd = $('.cd')
                const cdWidth = cd.offsetWidth
    
                //handle cd quay/dung
                const cdThumbAnimate = cdThumb.animate([
                    {transform: 'rotate(360deg)'}
                ], {
                    duration: 15000, //10s
                    iterations: Infinity
                })
                cdThumbAnimate.pause();
    
                // Zoom in / zoom out cd handling
                document.onscroll = function () {
                    const scrollTop = window.scrollY || document.documentElement.scrollTop;
                    const newCdWidth = cdWidth - scrollTop;
    
                    cd.style.width = newCdWidth > 0 ? newCdWidth + "px" : 0;
                    cd.style.opacity = newCdWidth / cdWidth;
                };
    
                // Play Click handling
                playBtn.onclick = function(){
                    if(app.isPlaying){
                        audio.pause()
                    }else{
                        audio.play()
                    }
                }
                audio.onpause = function(){
                    player.classList.remove('playing')
                    cdThumbAnimate.pause()
                    app.isPlaying = false
                }
                audio.onplay = function(){
                    player.classList.add('playing')
                    cdThumbAnimate.play()
                    app.isPlaying = true
                    progress.value = 0;
                }
                // the progress song has changed
                audio.ontimeupdate = function(){
                    const timePercent = Math.floor((audio.currentTime/audio.duration)*100) 
                    progress.value = timePercent;
                    progress.style.background = `linear-gradient(to right, var(--primary-color) ${timePercent}%, #d3d3d3 ${timePercent}%)`;
                }
                //set time audio when the progress change
                progress.oninput = function(e){
                    audio.play()
                    const progressPercent = e.target.value
                    audio.currentTime = (progressPercent/100)*audio.duration
                    progress.style.background = `linear-gradient(to right, var(--primary-color) ${progressPercent}%, #d3d3d3 ${progressPercent}%)`;
                }
                // event click next btn
                nextBtn.onclick = function(){
                    if(app.isRandom){
                        app.playRandomSong()
                    }else{
                        app.nextSong();
                    }
                    app.loadCurrentSong();
                    audio.play();
                }
                // event click prev btn
                prevBtn.onclick = function(){
                    if(app.isRandom){
                        app.playRandomSong()
                    }else{
                        app.prevSong();
                    }
                    app.loadCurrentSong();
                    audio.play()
                }
                // event click random btn
                randomBtn.onclick = function(){
                    app.isRandom =! app.isRandom
                    app.setConfig('isRandom', app.isRandom);
                    randomBtn.classList.toggle('active', app.isRandom)
                }
                // handle repeat btn
                repeatBtn.onclick = function(){
                    app.isRepeat = !app.isRepeat
                    app.setConfig('isRepeat', app.isRepeat);
                    repeatBtn.classList.toggle('active', app.isRepeat)
                }
                // handle volume
                volumeControl.onclick = function(){
                    if(volumeProgress.style.display ==='block'){
                        volumeProgress.style.display = 'none'
                    }else{
                        volumeProgress.style.display = 'block'
                    }
                }
                volumeProgress.oninput = function(e){
                    const volume = e.target.value/100
                    audio.volume = volume;
                    lowVolIcon.style.display = 'none';
                    muteVolIcon.style.display = 'none';
                    loudVolIcon.style.display = 'none' 
                    if (volume === 0){
                        muteVolIcon.style.display = 'block'
                    }     
                    else if(volume <= 0.5 && volume != 0){
                        lowVolIcon.style.display = 'block'
                    }else{
                        loudVolIcon.style.display = 'block'
                    }              
                }
                // handle ended audio 
                audio.onended = function(){
                    if(app.isRepeat){
                        audio.play();
                    }else{
                        if(!app.isRandom){
                            app.nextSong();
                        }else{
                            app.playRandomSong();
                        }
                        app.activeNewSong();
                        app.loadCurrentSong();
                        audio.play();
                    }
                }
                // song activation (event: click song )
                const songElements = $$('.song');
                songElements.forEach((song,index)=>{
                    song.onclick = function(e){
                        if(e.target.closest('.song:not(.active)')){
                            if(!e.target.closest('.option')){
                                app.currentIndex = index;
                                app.activeNewSong();
                                app.loadCurrentSong();
                                audio.play();
                            }
                        }
                        console.log(e.target)

                    }
                })
    
            },
            scrollToActiveSong: function(){
                setTimeout(()=>{
                    $('.song.active').scrollIntoView({
                        behavior: 'smooth',
                        block: 'end'
                    }, 500)
                })
            },
            loadCurrentSong: function(){
                heading.textContent = this.currentSong.name;
                cdThumb.style.backgroundImage = `url('${this.currentSong.image}')`
                audio.src = this.currentSong.path
                console.log(audio.src)
                this.setConfig('currentIndex', this.currentIndex)
            },
            loadConfig: function(){
                this.isRandom = this.config.isRandom
                this.isRepeat = this.config.isRepeat
                this.currentIndex = this.config.currentIndex
            },
            nextSong: function(){
                this.currentIndex++;
                if(this.currentIndex >= this.songs.length){
                    this.currentIndex = 0;
                }
                app.activeNewSong()
            },
            prevSong: function(){
                this.currentIndex--;
                if(this.currentIndex < 0){
                    this.currentIndex = this.songs.length - 1
                }
                app.activeNewSong()
            },
            playRandomSong: function(){
                let randomIndex
                do{
                    randomIndex = Math.floor(Math.random()*this.songs.length);
                }while(randomIndex === this.currentIndex)
                this.currentIndex = randomIndex;
                app.activeNewSong();            
            },
            activeNewSong: function(){
                const songElements =  $$('.song');
                songElements.forEach((song)=>{
                    song.classList.remove('active')
                })
                songElements.forEach((song, index)=>{
                    if(index == app.currentIndex){
                        song.classList.add('active')
                    }
                })
                app.scrollToActiveSong()
            },
            start: function(){
                // show the initial state of repeat, random btn and currentSong
                randomBtn.classList.toggle('active', app.isRandom)
                repeatBtn.classList.toggle('active', app.isRepeat)
                this.currentIndex = this.config.currentIndex
                // Define Object's properties
                this.defineProperties()
                // Render playlist
                this.render()            
                // load first music song to UI when running app
                this.loadCurrentSong()
                // Listen and handle events (Dom event)
                this.handleEvent()
                // assign config in app from reading localStorage
                this.loadConfig()
            }
    
        }
        app.start()
    
            