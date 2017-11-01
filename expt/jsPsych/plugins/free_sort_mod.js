/**
 * jspsych-free-sort
 * plugin for drag-and-drop sorting of a collection of images
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 * modified by kh 10/28/2017
 */


jsPsych.plugins['free-sort-mod'] = (function() {

  var plugin = {};

  jsPsych.pluginAPI.registerPreload('free-sort-mod', 'stimuli', 'image');

  plugin.info = {
    name: 'free-sort-mod',
    description: '',
    parameters: {
      stimuli: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Stimuli',
        default: undefined,
        array: true,
        description: 'Images to be displayed.'
      },
      // stim_height: {
      //   type: jsPsych.plugins.parameterType.INT,
      //   pretty_name: 'Stimulus height',
      //   default: 100,
      //   description: 'Height of images in pixels.'
      // },
      // stim_width: {
      //   type: jsPsych.plugins.parameterType.INT,
      //   pretty_name: 'Stimulus width',
      //   default: 100,
      //   description: 'Width of images in pixels'
      // },
      // sort_area_height: {
      //   type: jsPsych.plugins.parameterType.INT,
      //   pretty_name: 'Sort area height',
      //   default: 800,
      //   description: 'The height of the container that subjects can move the stimuli in.'
      // },
      // sort_area_width: {
      //   type: jsPsych.plugins.parameterType.INT,
      //   pretty_name: 'Sort area width',
      //   default: 800,
      //   description: 'The width of the container that subjects can move the stimuli in.'
      // },
      // prompt: {
      //   type: jsPsych.plugins.parameterType.STRING,
      //   pretty_name: 'Prompt',
      //   default: '',
      //   description: 'It can be used to provide a reminder about the action the subject is supposed to take.'
      // },
      // prompt_location: {
      //   type: jsPsych.plugins.parameterType.SELECT,
      //   pretty_name: 'Prompt location',
      //   options: ['above','below'],
      //   default: 'above',
      //   description: 'Indicates whether to show prompt "above" or "below" the sorting area.'
      // },
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        description: 'The text that appears on the button to continue to the next trial.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    function preloadImage(url){
        var img=new Image();
        img.src=url;
    }

    for (i = 0; i<8; i++){
      preloadImage('ims/im' + i + '_colored.png')
    }

    var start_time = (new Date()).getTime();

    var html = ""; //Add dividing line
    // check if there is a prompt and if it is shown above
    if (trial.prompt && trial.prompt_location == "above") {
      html += trial.prompt;
    }

    //set size params
    var w = window.innerWidth
    var h = window.innerHeight
    var sort_area_width  = w*0.4
    var sort_area_height = h*0.9
    var staging_area_height = sort_area_height/5.0 //where cards initially appear, pre-classification
    var category_box_height = sort_area_height-staging_area_height //blue and pink box heights
    var category_box_width = sort_area_width/2.0
    var stim_height = category_box_height/9.5
    var stim_width = stim_height*1.56

    html += '<div '+
      'id="jspsych-free-sort-arena" '+
      'class="jspsych-free-sort-arena" '+
      'style="position: relative; width:'+sort_area_width+'px; height:'+sort_area_height+'px; border:2px solid #444;"'+
      '><div style="position: absolute; top:0; left:0px; width:'+sort_area_width+'px; height:'+staging_area_height+'px;"></div>' +
      '<div id="pink_category"; style="position: absolute; top:'+staging_area_height+'; left:-2px; width:'+category_box_width+'px; height:'+category_box_height+'px; border:2px solid #444; background-color: #ffe6f2;"></div>' +
      '<div id="blue_category"; style="position: absolute; top:'+staging_area_height+'; left:'+(category_box_width-2.0)+'px; width:'+category_box_width+'px; height:'+category_box_height+'px; border:2px solid #444; background-color: #cce5ff;"></div>' +
      // '<div id="instructions_box"; type="text"; style="position: absolute; top:'+staging_area_height/2.0+'; left:15px; width:'+(sort_area_width-30)+'px; height:'+staging_area_height/2.0+'px;"></div>' +
      '</div>';

    // check if prompt exists and if it is shown below
    if (trial.prompt && trial.prompt_location == "below") {
      html += trial.prompt;
    }

    display_element.innerHTML = html;

    // store initial location data
    var init_locations = [];

    display_element.innerHTML += '<button id="jspsych-free-sort-done-btn" class="jspsych-btn">'+trial.button_label+'</button>';

    var maxz = 1;

    var moves = [];

    var make_all_draggable = function(){
      var draggables = display_element.querySelectorAll('.jspsych-free-sort-draggable');

      for(var i=0;i<draggables.length; i++){
        draggables[i].addEventListener('mousedown', function(event){
          var x = event.pageX - event.currentTarget.offsetLeft;
          var y = event.pageY - event.currentTarget.offsetTop - window.scrollY;
          var elem = event.currentTarget;
          elem.style.zIndex = ++maxz;

          var mousemoveevent = function(e){
            elem.style.top =  Math.min(sort_area_height - stim_height, Math.max(0,(e.clientY - y))) + 'px';
            elem.style.left = Math.min(sort_area_width  - stim_width,  Math.max(0,(e.clientX - x))) + 'px';
          }
          document.addEventListener('mousemove', mousemoveevent);

          var mouseupevent = function(e){
            document.removeEventListener('mousemove', mousemoveevent);
            moves.push({
              "src": elem.dataset.src,
              "x": elem.offsetLeft,
              "y": elem.offsetTop
            });
            document.removeEventListener('mouseup', mouseupevent);
          }
          document.addEventListener('mouseup', mouseupevent);
        });
      }
    }

    var add_image = function(source, coords, i){
      var id = 'im_' + i
      display_element.querySelector("#jspsych-free-sort-arena").innerHTML += '<img '+
          'id="'+id+'"'+
          'src='+source+' '+
          'data-src='+source+' '+
          'class="jspsych-free-sort-draggable" '+
          'draggable="false" '+
          'style="position: absolute; cursor: move; width:'+stim_width+'px; height:'+stim_height+'px; top:'+coords.y+'px; left:'+coords.x+'px;">'+
          '</img>';
      make_all_draggable()
    }

    function shuffle(a) {
      var j, x, i;
      for (i = a.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1));
          x = a[i];
          a[i] = a[j];
          a[j] = x;
      }
    }

    var init = function(){
      var draw_row = function(stims, start_y){
        var buffer = stim_width/8.0
        var total_width = (stims.length * stim_width) + ((stims.length-1) * buffer)
        var x = (sort_area_width - total_width)/2.0
        var coords = []
        for (i = 0; i < stims.length; i++){
          var ind = stims[i].split(/(\d+)/)[1]
          add_image(stims[i], {x:x, y: start_y}, ind)
          x += stim_width + buffer
        }
      }

      var shuffled_stims = trial.stimuli.slice(0)
      shuffle(shuffled_stims)
      draw_row(shuffled_stims.slice(0, 4), 5)
      draw_row(shuffled_stims.slice(4, 8), 15+stim_height)

      //label category boxes
      var pink_category_box = display_element.querySelector('#pink_category')
      pink_category_box.style.fontSize="30px"
      pink_category_box.innerHTML = 'Pink Category'
      var blue_category_box = display_element.querySelector('#blue_category')
      blue_category_box.style.fontSize="30px"
      blue_category_box.innerHTML = 'Blue Category'
    }

    var ind_to_show = 0

    var end_trial = function(){
      var el = document.querySelector('#im_' + ind_to_show);
      el.parentNode.removeChild(el);
      add_image('ims/im'+ind_to_show+'_colored.png', {x:(sort_area_width/2.0)-(stim_width/2.0), y:0}, '')
      ind_to_show += 1

      //display instructions
      // var instructions = display_element.querySelector('#instructions_box')
      // instructions.style.fontSize="14px"
      // instructions.innerHTML = 'The background color indicates to which category this card belongs. Drag '+
      // 'it to the correct box, then make as many (or no) changes to the placement of the other cards '+
      // 'as necessary to achieve the correct classifications.'
    }

    init()

    display_element.querySelector('#jspsych-free-sort-done-btn').addEventListener('click', function(){

      // var end_time = (new Date()).getTime();
      // var rt = end_time - start_time;
      // // gather data
      // // get final position of all objects
      // var final_locations = [];
      // var matches = display_element.querySelectorAll('.jspsych-free-sort-draggable');
      // for(var i=0; i<matches.length; i++){
      //   final_locations.push({
      //     "src": matches[i].dataset.src,
      //     "x": matches[i].style.position.left,
      //     "y": matches[i].style.position.top
      //   });
      // }

      // var trial_data = {
      //   "init_locations": JSON.stringify(init_locations),
      //   "moves": JSON.stringify(moves),
      //   "final_locations": JSON.stringify(final_locations),
      //   "rt": rt
      // };

      // // advance to next part
      // display_element.innerHTML = '';
      // jsPsych.finishTrial(trial_data);
      // init()

      alert('The background color indicates to which category this card belongs. Drag '+
      'it to the correct box, then make as many (or no) changes to the placement of the other cards '+
      'as necessary to achieve the correct classifications.')

      if (ind_to_show < trial.stimuli.length){
        end_trial()
      }
    });

  };

  // helper functions

  function random_coordinate(max_width, max_height) {
    var rnd_x = Math.floor(Math.random() * (max_width - 1));
    var rnd_y = Math.floor(Math.random() * (max_height - 1));

    return {
      x: rnd_x,
      y: rnd_y
    };
  }

  return plugin;
})();
