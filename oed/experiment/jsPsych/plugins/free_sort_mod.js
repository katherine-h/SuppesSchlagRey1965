/**
 * jspsych-free-sort
 * plugin for drag-and-drop sorting of a collection of images
 * Josh de Leeuw
 *
 * documentation: docs.jspsych.org
 *
 * modified by kh 10/28/2017
 */

 // TODO: Check RTs; Add timers?

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
      button_label: {
        type: jsPsych.plugins.parameterType.STRING,
        pretty_name: 'Button label',
        default:  'Continue',
        description: 'The text that appears on the button to continue to ' + 
                     'the next trial.'
      }
    }
  }

  plugin.trial = function(display_element, trial) {

    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////// PRELOADING, ETC. ///////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    var num_stims = 8

    var print_trial = false // bool, print trial details (debugging)

    // preload images not already auto-loaded by jsPsych
    for (var i = 0; i < num_stims; i++){
      preload_image('ims/im' + i + '_colored.png')
    }

    // define true categories of stims
    var true_categories = {'im0': 'blue',
                           'im1': 'pink',
                           'im2': 'pink',
                           'im3': 'blue',
                           'im4': 'pink',
                           'im5': 'pink',
                           'im6': 'blue',
                           'im7': 'blue'}

    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////// PAGE SETUP /////////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    // - page consists of several parts a sorting area (draggable region) and  
    //   a 'continue' button
    // - sorting area is divided into staging area (where stims initially
    //   appear), 'pink' category box, and 'blue' category box

    var html = ""; // add dividing line
    // check if there is a prompt and if it is shown above
    if (trial.prompt && trial.prompt_location == "above") {
      html += trial.prompt;
    }

    // set size params
    var w = window.innerWidth
    var h = window.innerHeight
    var sort_area_width  = w*0.4
    var sort_area_height = h*0.9
    var staging_area_height = sort_area_height/5.0 
    //blue and pink box heights
    var category_box_height = sort_area_height-staging_area_height 
    var category_box_width = sort_area_width/2.0
    var stim_height = category_box_height/9.5
    var stim_width = stim_height*1.56

    var configs = {'innerWidth': w, 
                   'innerHeight': h,
                   'sortAreaWidth': sort_area_width, 
                   'sortAreaHeight': sort_area_height,
                   'stagingAreaHeight': staging_area_height, 
                   'categoryBoxWidths': category_box_width, 
                   'categoryBoxHeights': category_box_height,
                   'stimWidth': stim_width, 
                   'stimHeight': stim_height}

    html += '<div ' +
      'id="jspsych-free-sort-arena" ' +
      'class="jspsych-free-sort-arena" ' +
      'style="position: relative; width:' +
          sort_area_width + 'px; height:' + sort_area_height + 
          'px; border:2px solid #444;"' +
      '><div style="position: absolute; top:0; left:0px; width:' + 
          sort_area_width + 'px; height:' + staging_area_height + 
          'px;"></div>' +
      '<div id="pink_category"; style="position: absolute; top:' + 
          staging_area_height + '; left:-2px; width:' + category_box_width + 
          'px; height:' + category_box_height + 'px; border:2px solid #444; ' + 
          'background-color: #ffe6f2;"></div>' +
      '<div id="blue_category"; style="position: absolute; top:' + 
          staging_area_height + '; left:' + (category_box_width-2.0) + 
          'px; width:' + category_box_width + 'px; height:' + 
          category_box_height + 'px; border:2px solid #444; ' + 
          'background-color: #cce5ff;"></div>' +
      '</div>'

    // check if prompt exists and if it is shown below
    if (trial.prompt && trial.prompt_location == "below") {
      html += trial.prompt;
    }

    display_element.innerHTML = html;

    display_element.innerHTML += '<button id="jspsych-free-sort-done-btn" ' + 
                                 'class="jspsych-btn">' + trial.button_label + 
                                 '</button>'

    //label category boxes
    var pink_category_box = display_element.querySelector('#pink_category')
    pink_category_box.style.fontSize="30px"
    pink_category_box.innerHTML = 'Pink Category'
    var blue_category_box = display_element.querySelector('#blue_category')
    blue_category_box.style.fontSize="30px"
    blue_category_box.innerHTML = 'Blue Category'

    ///////////////////////////////////////////////////////////////////////////
    ////////////////////////// MAIN EXPERIMENT ////////////////////////////////
    ///////////////////////////////////////////////////////////////////////////

    var maxz = 1
    var moves = [] // not actually storing for now

    var make_all_draggable = function(){
      var draggables = display_element.querySelectorAll(
                          '.jspsych-free-sort-draggable')

      for (var i = 0; i<draggables.length; i++){
        draggables[i].addEventListener('mousedown', function(event){
          var x = event.pageX - event.currentTarget.offsetLeft
          var y = event.pageY - event.currentTarget.offsetTop - window.scrollY
          var elem = event.currentTarget
          elem.style.zIndex = ++maxz

          var mousemoveevent = function(e){
            elem.style.top =  Math.min(sort_area_height - stim_height, 
                              Math.max(0,(e.clientY - y))) + 'px'
            elem.style.left = Math.min(sort_area_width  - stim_width,  
                              Math.max(0,(e.clientX - x))) + 'px'
          }
          document.addEventListener('mousemove', mousemoveevent)

          var mouseupevent = function(e){
            document.removeEventListener('mousemove', mousemoveevent)
            moves.push({
              "src": elem.dataset.src,
              "x": elem.offsetLeft,
              "y": elem.offsetTop
            })
            document.removeEventListener('mouseup', mouseupevent)
          }
          document.addEventListener('mouseup', mouseupevent)
        })
      }
    }

    var add_image = function(source, coords, i){
      // Add a new stimulus (colored card) to the screen
      var id = 'im' + i
      display_element.querySelector("#jspsych-free-sort-arena").innerHTML += '<img ' +
          'id="' + id + '"' +
          'src=' + source + ' ' +
          'data-src=' + source + ' ' +
          'class="jspsych-free-sort-draggable" ' +
          'draggable="false" '+
          'style="position: absolute; cursor: move; width:' + stim_width + 
              'px; height:' + stim_height + 'px; top:' + coords.y + 
              'px; left:' + coords.x + 'px;">' +
          '</img>'
      make_all_draggable()
    }

    var add_locations = function(trial_data){
      // Get current card locations, determine reinforcement type,
      //  count up moves (reclassifications), and save to data
      var total_reclassifications_this_trial = 0
      var matches = display_element.querySelectorAll(
                      '.jspsych-free-sort-draggable')
      for (var i = 0; i < matches.length; i++) {
        var x = Number(matches[i].style.left.replace('px',''))
        var y = Number(matches[i].style.top.replace('px',''))
        if (y < staging_area_height) {
          region = 'staging'
          // overlap w/ a category box?
          if (y + stim_height > staging_area_height) {
            region = 'ambiguous'
          }
        } else {
          if (x < category_box_width) {
            region = 'pink'
            // overlap w/ blue box?
            if (x + stim_width > category_box_width) {
              region = 'ambiguous'
            }
          } else {
            region = 'blue'
          }
        }

        // check if reclassified since last trial
        var reclassified = null
        if (!(trial_data['trial'] == 'starting_config')) {
          var prev_location = data[data.length-1][matches[i].id + '_region']
          if (!(prev_location == null)) { // only interested in white cards that existed in previous trial
            if (prev_location == region) {
              reclassified = false
            } else {
              reclassified = true
              total_reclassifications_this_trial += 1
            }
          }
        }
        
        // add to trial data
        trial_data[matches[i].id + '_src'] = matches[i].dataset.src
        trial_data[matches[i].id + '_x'] = x
        trial_data[matches[i].id + '_y'] = y
         // region: blue, pink, staging, or ambiguous
        trial_data[matches[i].id + '_region'] = region
        // reclassified since last trial?
        trial_data[matches[i].id + '_reclassified'] = reclassified 
      }

      var add_null_trial = function(id) {
        trial_data[id + '_src'] = null
        trial_data[id + '_x'] = null
        trial_data[id + '_y'] = null
        trial_data[id + '_region'] = null
        trial_data[id + '_reclassified'] = null
      }

      // add in 'null' data fields for ims not currently on screen (white cards
      //  that have been removed and colored cards not yet shown)
      for (var i = 0; i < num_stims; i++){
        if (!('im' + i + '_colored' + '_src' in trial_data)) {
          add_null_trial('im' + i + '_colored')
        }
        if (!('im' + i + '_src' in trial_data)) {
          add_null_trial('im' + i)
        }
      }

      if (print_trial == true) {
        console.log('')
        console.log('Trial = ' + trial_data['trial'])
      }

      // determine reinforcement type (pos or neg, depends on 
      // participant's classifications)
      if (!(trial_data['trial'] == 'starting_config' || 
            trial_data['trial'] == 'initial_classification')) {
        var previous_categorization = data[data.length-1]['im' + trial_ind + 
                                                          '_region']
        
        // console.log('PREV')
        // console.log(previous_categorization)

        if (previous_categorization == 'staging' || 
            previous_categorization == 'ambiguous') {
          trial_data['reinforcement'] = undefined
        } else {
          if (previous_categorization == true_categories['im' + trial_ind]) {
            trial_data['reinforcement'] = 'positive'
          } else {
            trial_data['reinforcement'] = 'negative'
          }
        }

        // console.log('TRUE')
        // console.log(true_categories['im' + trial_ind])

      } else {
        trial_data['reinforcement'] = null
      }

      if (trial_data['trial'] == 'starting_config') {
        trial_data['total_reclassifications'] = null
        trial_data['any_reclassifications'] = null
      } else {
        trial_data['total_reclassifications'] = total_reclassifications_this_trial
        if (total_reclassifications_this_trial == 0) {
          trial_data['any_reclassifications'] = false
        } else {
          trial_data['any_reclassifications'] = true
        }
      }
      
      if (print_trial == true) {
        console.log('Reinforcement type = ' + trial_data['reinforcement'])
        console.log('Any reclassifications? = ' + 
                    trial_data['any_reclassifications'])
        console.log('Total reclassifications = ' + 
                    trial_data['total_reclassifications'])
      }

      data.push(trial_data)
    }

    var add_trial_data = function(){
      // Add this trial's data to data to save
      var trial_end_time = (new Date()).getTime()
      var trial_data = {}
      trial_data['trial'] = trial_ind
      trial_data['rt'] = trial_end_time - trial_start_time
      add_locations(trial_data)
    }

    var next_trial = function(){
      // Proceed to next trial
      // remove a white card
      var el = document.querySelector('#im' + trial_ind);
      el.parentNode.removeChild(el);
      // place a colored card with the same pattern of letters
      add_image('ims/im' + trial_ind + '_colored.png', {x:(
                sort_area_width/2.0)-(stim_width/2.0), y:0}, trial_ind + 
                '_colored')
      trial_start_time = (new Date()).getTime()
    }

    var init = function(){
      // Place stimuli in staging area in random order
      var draw_row = function(stims, start_y){
        var buffer = stim_width/8.0
        var total_width = (stims.length * stim_width) + (
                          (stims.length-1) * buffer)
        var x = (sort_area_width - total_width)/2.0
        for (var i = 0; i < stims.length; i++){
          var ind = stims[i].split(/(\d+)/)[1]
          add_image(stims[i], {x:x, y: start_y}, ind)
          x += stim_width + buffer
        }
      }

      var shuffled_stims = trial.stimuli.slice(0)
      shuffle(shuffled_stims)
      draw_row(shuffled_stims.slice(0, 4), 5)
      draw_row(shuffled_stims.slice(4, 8), 15+stim_height)

      // Save starting config
      var start_data = {}
      start_data['trial'] = 'starting_config'
      start_data['rt'] = null
      add_locations(start_data)

      trial_start_time = (new Date()).getTime()
    }

    var data = [] // list of dictionaries, where each dictionary is a trial
    var trial_ind = 'initial_classification'
    init()

    // define 'continue' button
    display_element.querySelector('#jspsych-free-sort-done-btn'
                                  ).addEventListener('click', function(){
      add_trial_data()
      if (trial_ind == 'initial_classification') {
        trial_ind = 0
      } else {
        trial_ind += 1
      }
      if (trial_ind < trial.stimuli.length){
        alert('The background color indicates to which category this card ' +
              'belongs. Drag it to the correct box, then make as many ' +
              '(or no) changes to the placement of the other cards ' +
              'as necessary to achieve the correct classifications.')
        next_trial()
      } else {
        // advance to next part
        display_element.innerHTML = '';
        var free_sort_data = {'configs' : configs, 
                              'data' : data}
        jsPsych.finishTrial(free_sort_data)
      }
    })
  }

  ///////////////////////////////////////////////////////////////////////////
  /////////////////////////////// UTILS /////////////////////////////////////
  ///////////////////////////////////////////////////////////////////////////

  var shuffle = function(a) {
      var j, x, i
      for (var i = a.length - 1; i > 0; i--) {
          j = Math.floor(Math.random() * (i + 1))
          x = a[i]
          a[i] = a[j]
          a[j] = x
      }
    }

  var random_coordinate = function(max_width, max_height) {
    var rnd_x = Math.floor(Math.random() * (max_width - 1))
    var rnd_y = Math.floor(Math.random() * (max_height - 1))

    return {
      x: rnd_x,
      y: rnd_y
    }
  }

  var preload_image = function(url){
        var img=new Image()
        img.src=url
  }

  return plugin;
})()
