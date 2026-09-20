/* Original quiz data: user's game-for-son-3_v2/src/data/SpellingQuizData.js */
const BASEBALL_SPELLING_QUIZZES = [
    {
        id: 'spelling-01',
        spokenText: '정우가 김밥을 먹어요.',
        promptText: '정우가 000 먹어요.',
        answer: '김밥을',
        choices: ['김밥을', '김박을', '김바블', '김빱을']
    },
    {
        id: 'spelling-02',
        spokenText: '아빠가 국밥을 먹어요.',
        promptText: '아빠가 000 먹어요.',
        answer: '국밥을',
        choices: ['국밥을', '국박을', '국바블', '국빱을']
    },
    {
        id: 'spelling-03',
        spokenText: '엄마가 책상을 닦아요.',
        promptText: '엄마가 000 닦아요.',
        answer: '책상을',
        choices: ['책상을', '채상을', '책쌍을', '책상를']
    },
    {
        id: 'spelling-04',
        spokenText: '바람이 창문을 흔들어요.',
        promptText: '바람이 000 흔들어요.',
        answer: '창문을',
        choices: ['창문을', '창무늘', '창문를', '창무를']
    },
    {
        id: 'spelling-05',
        spokenText: '정우가 신발을 신어요.',
        promptText: '정우가 000 신어요.',
        answer: '신발을',
        choices: ['신발을', '신바를', '신발를', '신발울']
    },
    {
        id: 'spelling-06',
        spokenText: '엄마가 꽃병을 옮겨요.',
        promptText: '엄마가 000 옮겨요.',
        answer: '꽃병을',
        choices: ['꽃병을', '꼳병을', '꼬병을', '꽃병를']
    },
    {
        id: 'spelling-07',
        spokenText: '아빠가 옷장을 열어요.',
        promptText: '아빠가 000 열어요.',
        answer: '옷장을',
        choices: ['옷장을', '옫장을', '오장을', '옷장를']
    },
    {
        id: 'spelling-08',
        spokenText: '빗방울이 톡톡 떨어져요.',
        promptText: '000 톡톡 떨어져요.',
        answer: '빗방울이',
        choices: ['빗방울이', '빋방울이', '비방울이', '빗방우리']
    },
    {
        id: 'spelling-09',
        spokenText: '정우가 운동장을 달려요.',
        promptText: '정우가 000 달려요.',
        answer: '운동장을',
        choices: ['운동장을', '운돈장을', '운동장를', '웅동장을']
    },
    {
        id: 'spelling-10',
        spokenText: '선생님이 칠판을 지워요.',
        promptText: '선생님이 000 지워요.',
        answer: '칠판을',
        choices: ['칠판을', '칠파늘', '칠반을', '칠판를']
    },
    {
        id: 'spelling-11',
        spokenText: '공책을 가방에 넣어요.',
        promptText: '000 가방에 넣어요.',
        answer: '공책을',
        choices: ['공책을', '공채글', '공책를', '공첵을']
    },
    {
        id: 'spelling-12',
        spokenText: '색종이를 반듯이 접어요.',
        promptText: '000 반듯이 접어요.',
        answer: '색종이를',
        choices: ['색종이를', '색종일', '샏종이를', '색조이를']
    },
    {
        id: 'spelling-13',
        spokenText: '밥상을 같이 차려요.',
        promptText: '000 같이 차려요.',
        answer: '밥상을',
        choices: ['밥상을', '밥쌍을', '바상을', '밥상를']
    },
    {
        id: 'spelling-14',
        spokenText: '손톱을 짧게 잘라요.',
        promptText: '000 짧게 잘라요.',
        answer: '손톱을',
        choices: ['손톱을', '손톱를', '손토블', '손돕을']
    },
    {
        id: 'spelling-15',
        spokenText: '발톱을 조심히 깎아요.',
        promptText: '000 조심히 깎아요.',
        answer: '발톱을',
        choices: ['발톱을', '발토블', '발돕을', '발톱를']
    },
    {
        id: 'spelling-16',
        spokenText: '할머니께 엽서를 써요.',
        promptText: '할머니께 000 써요.',
        answer: '엽서를',
        choices: ['엽서를', '여프서를', '엽셔를', '엽쓰를']
    },
    {
        id: 'spelling-17',
        spokenText: '아빠가 앞문을 닫아요.',
        promptText: '아빠가 000 닫아요.',
        answer: '앞문을',
        choices: ['앞문을', '압무늘', '앞문를', '압문을']
    },
    {
        id: 'spelling-18',
        spokenText: '뒷문을 살짝 열어요.',
        promptText: '000 살짝 열어요.',
        answer: '뒷문을',
        choices: ['뒷문을', '뒫무늘', '뒤문을', '뒷문를']
    },
    {
        id: 'spelling-19',
        spokenText: '나비가 꽃밭을 날아요.',
        promptText: '나비가 000 날아요.',
        answer: '꽃밭을',
        choices: ['꽃밭을', '꼳바틀', '꽃받을', '꽃밭를']
    },
    {
        id: 'spelling-20',
        spokenText: '아저씨가 벽돌을 쌓아요.',
        promptText: '아저씨가 000 쌓아요.',
        answer: '벽돌을',
        choices: ['벽돌을', '벽도를', '벽또를', '벽돌를']
    },
    {
        id: 'spelling-21',
        spokenText: '책장을 조용히 넘겨요.',
        promptText: '000 조용히 넘겨요.',
        answer: '책장을',
        choices: ['책장을', '책짱을', '채장을', '책장를']
    },
    {
        id: 'spelling-22',
        spokenText: '밥그릇을 싱크대에 놔요.',
        promptText: '000 싱크대에 놔요.',
        answer: '밥그릇을',
        choices: ['밥그릇을', '밥그르슬', '밥그릇를', '밥그릇울']
    },
    {
        id: 'spelling-23',
        spokenText: '젓가락을 바르게 잡아요.',
        promptText: '000 바르게 잡아요.',
        answer: '젓가락을',
        choices: ['젓가락을', '저까락을', '젓가라글', '젓가락를']
    },
    {
        id: 'spelling-24',
        spokenText: '깃발이 높이 펄럭여요.',
        promptText: '000 높이 펄럭여요.',
        answer: '깃발이',
        choices: ['깃발이', '깃바리', '기빨이', '깃발히']
    },
    {
        id: 'spelling-25',
        spokenText: '정우가 콧노래를 불러요.',
        promptText: '정우가 000 불러요.',
        answer: '콧노래를',
        choices: ['콧노래를', '콘노래를', '코노래를', '콧노래루']
    },
    {
        id: 'spelling-26',
        spokenText: '손수건을 주머니에 넣어요.',
        promptText: '000 주머니에 넣어요.',
        answer: '손수건을',
        choices: ['손수건을', '손수거늘', '손수건를', '손수건울']
    },
    {
        id: 'spelling-27',
        spokenText: '넘어져서 무릎을 닦아요.',
        promptText: '넘어져서 000 닦아요.',
        answer: '무릎을',
        choices: ['무릎을', '무르플', '무릅을', '무릎를']
    },
    {
        id: 'spelling-28',
        spokenText: '장화 신고 흙길을 걸어요.',
        promptText: '장화 신고 000 걸어요.',
        answer: '흙길을',
        choices: ['흙길을', '흑끼를', '흙기를', '흙길를']
    },
    {
        id: 'spelling-29',
        spokenText: '아픈 동생이 닭죽을 먹어요.',
        promptText: '아픈 동생이 000 먹어요.',
        answer: '닭죽을',
        choices: ['닭죽을', '닥쭈글', '닭주글', '닭죽를']
    },
    {
        id: 'spelling-30',
        spokenText: '정우는 밖에 나가 놀아요.',
        promptText: '정우는 000 나가 놀아요.',
        answer: '밖에',
        choices: ['밖에', '바께', '박에', '박께']
    },
    {
        id: 'spelling-31',
        spokenText: '가방에 연필이 없어요.',
        promptText: '가방에 연필이 000.',
        answer: '없어요',
        choices: ['없어요', '업서요', '없서요', '업어요']
    },
    {
        id: 'spelling-32',
        spokenText: '책상 위에 책이 있어요.',
        promptText: '책상 위에 책이 000.',
        answer: '있어요',
        choices: ['있어요', '이써요', '잇어요', '있서요']
    },
    {
        id: 'spelling-33',
        spokenText: '가족이 같이 산책해요.',
        promptText: '가족이 000 산책해요.',
        answer: '같이',
        choices: ['같이', '가치', '갇이', '같히']
    },
    {
        id: 'spelling-34',
        spokenText: '화분에 꽃이 피었어요.',
        promptText: '화분에 000 피었어요.',
        answer: '꽃이',
        choices: ['꽃이', '꼬치', '꽃히', '꼳이']
    },
    {
        id: 'spelling-35',
        spokenText: '토끼가 밭에 가요.',
        promptText: '토끼가 000 가요.',
        answer: '밭에',
        choices: ['밭에', '바테', '받에', '받헤']
    },
    {
        id: 'spelling-36',
        spokenText: '새 옷이 참 예뻐요.',
        promptText: '새 000 참 예뻐요.',
        answer: '옷이',
        choices: ['옷이', '오시', '옫이', '옷히']
    },
    {
        id: 'spelling-37',
        spokenText: '엄마가 앞치마를 입어요.',
        promptText: '엄마가 000 입어요.',
        answer: '앞치마를',
        choices: ['앞치마를', '압치마를', '앞치말를', '앞치마루']
    },
    {
        id: 'spelling-38',
        spokenText: '아빠가 연필을 깎아요.',
        promptText: '아빠가 연필을 000.',
        answer: '깎아요',
        choices: ['깎아요', '깍아요', '까까요', '깍가요']
    },
    {
        id: 'spelling-39',
        spokenText: '신발 끈을 묶어요.',
        promptText: '신발 끈을 000.',
        answer: '묶어요',
        choices: ['묶어요', '무꺼요', '묵어요', '묶서요']
    },
    {
        id: 'spelling-40',
        spokenText: '정우가 그림책을 읽어요.',
        promptText: '정우가 그림책을 000.',
        answer: '읽어요',
        choices: ['읽어요', '일거요', '익어요', '읽서요']
    },
    {
        id: 'spelling-41',
        spokenText: '의자에 바르게 앉아요.',
        promptText: '의자에 바르게 000.',
        answer: '앉아요',
        choices: ['앉아요', '안자요', '않아요', '안쟈요']
    },
    {
        id: 'spelling-42',
        spokenText: '문을 천천히 닫아요.',
        promptText: '문을 천천히 000.',
        answer: '닫아요',
        choices: ['닫아요', '다다요', '닫아여', '닫가요']
    },
    {
        id: 'spelling-43',
        spokenText: '꽃을 밟지 않아요.',
        promptText: '꽃을 000 않아요.',
        answer: '밟지',
        choices: ['밟지', '발찌', '밥지', '밟찌']
    },
    {
        id: 'spelling-44',
        spokenText: '냄비에 달걀을 삶아요.',
        promptText: '냄비에 달걀을 000.',
        answer: '삶아요',
        choices: ['삶아요', '살마요', '삼아요', '삶아여']
    },
    {
        id: 'spelling-45',
        spokenText: '운동장이 아주 넓어요.',
        promptText: '운동장이 아주 000.',
        answer: '넓어요',
        choices: ['넓어요', '널버요', '넓어여', '넙어요']
    },
    {
        id: 'spelling-46',
        spokenText: '연필이 조금 짧아요.',
        promptText: '연필이 조금 000.',
        answer: '짧아요',
        choices: ['짧아요', '짤바요', '짧아여', '짤아요']
    },
    {
        id: 'spelling-47',
        spokenText: '오늘 하늘이 맑아요.',
        promptText: '오늘 하늘이 000.',
        answer: '맑아요',
        choices: ['맑아요', '말가요', '맑아여', '말아요']
    },
    {
        id: 'spelling-48',
        spokenText: '교실이 환하게 밝아요.',
        promptText: '교실이 환하게 000.',
        answer: '밝아요',
        choices: ['밝아요', '발가요', '밝아여', '발까요']
    },
    {
        id: 'spelling-49',
        spokenText: '손을 씻고 밥을 먹어요.',
        promptText: '손을 000 밥을 먹어요.',
        answer: '씻고',
        choices: ['씻고', '씨꼬', '씯고', '씻구']
    },
    {
        id: 'spelling-50',
        spokenText: '책을 읽고 줄을 쳐요.',
        promptText: '책을 000 줄을 쳐요.',
        answer: '읽고',
        choices: ['읽고', '일꼬', '익고', '읽구']
    }
];


(function () {
  "use strict";
  const $=id=>document.getElementById(id);
  const words=["빛나라","잡혀라","신난다","즐겁다","행복해","반짝반짝","멋지다","최고야","힘내자","영차영차","물고기","바다몽","기쁘다","사랑해","웃자웃어","함께해","파이팅","건강해","씩씩하게","고마워"];
  const kinds=["math","spelling","typing"];
  const pick=(a,r=Math.random)=>a[Math.floor(r()*a.length)];
  const integer=(min,max,r=Math.random)=>min+Math.floor(r()*(max-min+1));
  function shuffle(a,r=Math.random){const c=[...a];for(let i=c.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[c[i],c[j]]=[c[j],c[i]];}return c;}
  // The source game's advanced chapter: two-digit sums/differences and 2..5 times 2..9.
  function makeMath(r=Math.random,op=pick(["+","-","×"],r)){
    const a=op==="+"?integer(10,30,r):op==="-"?integer(15,35,r):integer(2,5,r);
    const b=op==="+"?integer(5,20,r):op==="-"?integer(5,15,r):integer(2,9,r);
    const answer=op==="+"?a+b:op==="-"?a-b:a*b,choices=new Set([answer]);
    for(let i=1;choices.size<4&&i<20;i++)choices.add(Math.max(0,answer+(i%2?i:-i)));
    return {kind:"math",prompt:a+" "+op+" "+b+" = ?",answer,options:shuffle([...choices],r),a,b,op};
  }
  function makeQuestion(kind,r=Math.random){
    if(kind==="math")return makeMath(r);
    if(kind==="spelling"){const q=pick(BASEBALL_SPELLING_QUIZZES,r);return {kind,prompt:q.promptText,spokenText:q.spokenText,answer:q.answer,options:shuffle(q.choices,r)};}
    const answer=pick(words,r);return {kind:"typing",prompt:answer,answer};
  }
  let active=false,finished=false,tries=0,lastKind=null,question=null,nextAction=null,previousFocus=null;
  function feedback(message,correct=false){$("quizFeedback").textContent=message;$("quizFeedback").classList.toggle("correct",correct);}
  function finish(correct){
    if(finished)return;
    finished=true;$("quizOptions").querySelectorAll("button").forEach(b=>{b.disabled=true;});
    $("quizInput").disabled=true;$("quizSubmit").disabled=true;
    feedback(correct?"정답이에요! 다음 경기로 가요! ⚾":'정답은 "'+question.answer+'"예요. 다음 경기에서 또 도전해요!',correct);
    $("quizContinue").hidden=false;$("quizContinue").focus({preventScroll:true});
    if(typeof window.BaseballQuizSound==="function")window.BaseballQuizSound(correct);
  }
  function choose(button){
    if(!active||finished||button.disabled)return;
    const selected=question.kind==="math"?Number(button.dataset.answer):button.dataset.answer;
    if(selected===question.answer){button.classList.add("correct");finish(true);return;}
    tries++;button.disabled=true;button.classList.add("wrong");
    if(tries>=2){finish(false);return;}
    const remaining=[...$("quizOptions").querySelectorAll("button")].filter(b=>!b.disabled&&(question.kind==="math"?Number(b.dataset.answer):b.dataset.answer)!==question.answer);
    if(remaining.length){remaining[0].disabled=true;remaining[0].classList.add("eliminated");}
    feedback("괜찮아요! 틀린 보기 하나를 지웠어요. 한 번 더 골라 봐요.");
  }
  function submit(){
    if(!active||finished)return;
    const input=$("quizInput"),value=input.value.trim().normalize("NFC");
    if(!value){feedback("한글 단어를 입력해 주세요.");return;}
    if(value===question.answer.normalize("NFC")){finish(true);return;}
    if(++tries>=2){finish(false);return;}
    feedback("조금 달라요. 글자를 다시 살펴보고 한 번 더 써 봐요.");input.select();
  }
  function speak(){
    if(question?.kind!=="spelling"||!("speechSynthesis" in window))return;
    window.speechSynthesis.cancel();const speech=new SpeechSynthesisUtterance(question.spokenText);
    speech.lang="ko-KR";speech.rate=.85;window.speechSynthesis.speak(speech);
  }
  function render(){
    const labels={math:"숫자 퀴즈",spelling:"맞춤법 퀴즈",typing:"한글 타이핑"};
    $("quizType").textContent=labels[question.kind]+" · 한 문제만!";
    $("quizTitle").textContent=question.kind==="math"?"계산하고 정답을 골라요!":question.kind==="spelling"?"빈칸에 맞는 말을 골라요!":"보이는 한글을 똑같이 써요!";
    $("quizPrompt").textContent=question.prompt;$("quizOptions").replaceChildren();
    $("quizOptions").hidden=question.kind==="typing";$("quizTyping").hidden=question.kind!=="typing";
    $("quizSpeech").hidden=question.kind!=="spelling"||!("speechSynthesis" in window);
    $("quizContinue").hidden=true;$("quizInput").disabled=false;$("quizInput").value="";$("quizSubmit").disabled=false;feedback("");
    if(question.options)for(const value of question.options){
      const button=document.createElement("button");button.type="button";button.className="quiz-option";
      button.textContent=String(value);button.dataset.answer=String(value);
      button.addEventListener("click",()=>choose(button));$("quizOptions").appendChild(button);
    }
    if(question.kind==="typing")$("quizTitle").focus({preventScroll:true});
    else $("quizOptions").querySelector("button")?.focus({preventScroll:true});
  }
  function open(action){
    if(active||typeof action!=="function")return false;
    previousFocus=document.activeElement;nextAction=action;tries=0;finished=false;active=true;
    lastKind=pick(kinds.filter(kind=>kind!==lastKind));question=makeQuestion(lastKind);
    $("quizModal").hidden=false;render();return true;
  }
  function continueGame(){
    if(!active||!finished)return;
    active=false;$("quizModal").hidden=true;
    if("speechSynthesis" in window)window.speechSynthesis.cancel();
    const action=nextAction;nextAction=null;question=null;previousFocus?.focus?.({preventScroll:true});action?.();
  }
  function init(){
    $("quizSpeech").addEventListener("click",speak);
    $("quizSubmit").addEventListener("click",submit);
    $("quizInput").addEventListener("keydown",event=>{
      if(event.key==="Enter"&&!event.isComposing&&event.keyCode!==229){event.preventDefault();submit();}
    });
    $("quizContinue").addEventListener("click",continueGame);
  }
  window.BaseballQuiz={init,open,makeMath,makeQuestion,get active(){return active;}};
})();
