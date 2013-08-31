root = exports ? this

#############################################################################
#Model for storing this sketch
#SketchData is an array of SketchStrokes
class SketchData
  constructor: ()->
    @strokes = []
  addStroke: (stroke)->
    @strokes.push stroke

#############################################################################
#Model for storing a single pen stroke
#a pen stroke is an array of points, pressures, timestamps and a color value
class SketchStroke
  constructor: () ->
    @color = 'rgba(255,0,0,0.5)'
    @points = []
    @pressures = []
    @timestamps = []

  addData: (point, pressure) ->
    @points.push point
    @pressures.push pressure
    @timestamps.push Time.now

#############################################################################
#View class responsible for rendering lines
#encapsulates an HTML5 canvas
#given a set of data, draws the points as lines on the canvas
class SketchView
  constructor: (opts) ->
    @$canvas = $('<canvas>',opts).attr('width',opts['width']).attr('height',opts['height'])
    @width = @$canvas.width()
    @height = @$canvas.height()
    @ctx = @$canvas[0].getContext('2d')
    @ctx.globalCompositeOperation = "source-over"
  drawStroke: (stroke) ->
  drawStrokes: (strokes) ->
  playbackStrokes: (strokes) ->
  clear: ()->


##################################################################################### 
# Event router utility class that binds drawing specific event listeners to a given jQuery HTML element
# provides pen coordinates, pen pressure
# provides methods to start and stop listening
# and callbacks to delegate handling

class SketchListener
  constructor: (element) ->
    @$element = element;
    
    #these are events that external parties can 'listen to'
    #use addCallback, using one of these eventNames, and a function to call
    @callbacks = {onCanvasMouseHover:[], onCanvasMouseDown:[], onCanvasMouseMove:[], onCanvasMouseUp:[], onCanvasMouseOut:[]}
    @mouseCoord = [0,0];
    @touchSupported = ('ontouchstart' in window)

  #start listening by adding bindings
  start: =>
    #map touch events to mouse events as well, for future touch support
    if @touchSupported
      @mouseDownEvent = "touchstart"
      @mouseMoveEvent = "touchmove"
      @mouseUpEvent = "touchend"
    else
      @mouseDownEvent = "mousedown"
      @mouseMoveEvent = "mousemove"
      @mouseUpEvent = "mouseup"
      @$element.bind( @mouseMoveEvent, @onCanvasMouseHover )
      @$element.bind( 'mouseout', @onCanvasMouseOut )
    @$element.bind( @mouseDownEvent, @onCanvasMouseDown )

  #stop listening by removing bindings
  stop: =>
    @$element.unbind()

  addCallback: (eventName, func) =>
    @callbacks[eventName].push(func)

  removeCallback: (eventName, func) =>
    indexOfCallback = @callbacks[eventName].indexOf(func)
    @callbacks[eventName].splice(indexOfCallback,1)

  onCanvasMouseHover: (event) =>
    #this is what happens when you are hovering your mouse
    @getMouseCoord(event)
    for callback in @callbacks['onCanvasMouseHover']
      callback.call()

  onCanvasMouseOut: (event) =>
    for callback in @callbacks['onCanvasMouseOut']
      callback.call()

  onCanvasMouseDown: (event) =>
    @getMouseCoord( event )
    for callback in @callbacks['onCanvasMouseDown']
      callback.call()
    #drawing is about to start, switch out hover listening for draw event
    @$element.unbind(@mouseMoveEvent, @onCanvasMouseHover) unless @touchSupported
    $(document).bind( @mouseMoveEvent, @onCanvasMouseMove )
    $(document).bind( @mouseUpEvent, @onCanvasMouseUp )


  getMouseCoord: (event) =>
    #find the mouse coord relative to the canvas, regardless of scrolling
    if (@touchSupported)
      target = event.originalEvent.touches[0]
    else 
      target = event
    
    offset = @$element.offset();
    @mouseCoord.x = Math.round(target.pageX - offset.left);
    @mouseCoord.y = Math.round(target.pageY - offset.top);
    # Renderer.drawDot(@$element[0].getContext('2d'),[@mouseCoord.x,@mouseCoord.y])

  onCanvasMouseMove: (event) =>
    @getMouseCoord( event )
    for callback in @callbacks['onCanvasMouseMove']
      callback.call()

    event.preventDefault();
    return false;

  onCanvasMouseUp: (event) => 
    for callback in @callbacks['onCanvasMouseUp']
      callback.call()
    #drawing as stopped, switch out draw listening for hover listening
    $(document).unbind( @mouseMoveEvent, @onCanvasMouseMove )
    $(document).unbind( @mouseUpEvent, @onCanvasMouseUp )
    @$element.bind(@mouseMoveEvent, @onCanvasMouseHover) unless @touchSupported






# #this class is responsible for actually drawing lines
# TODO - refactor this
class Renderer
  this.apply = (layer, instruction) ->
    context = layer[0].getContext('2d')
  this.clear = (ctx, width, height) ->
    ctx.clearRect( 0 , 0 , width, height)
  this.drawDot = (ctx, point) ->
    x = point[0]
    y = point[1]
    pressure = point[2]
    ctx.globalCompositeOperation = "source-over"
    ctx.beginPath()
    ctx.arc(x, y, 1, 0, Math.PI * 2, true);
    ctx.fillStyle='rgba(255,0,0,0.5)'
    ctx.fill()
  this.drawStroke = (ctx, stroke) ->
    #size and color don't change
    color = stroke[0]
    size = stroke[1]
    points = stroke[2]
    if color == null
      ctx.globalCompositeOperation = "destination-out" 
      color = 'rgba(255,255,255,1)'
    else
      ctx.globalCompositeOperation = "source-over"

    if points.length >= 2 #Draw curve if there are at least two points
        #Clear path and move to the start point
        ctx.beginPath()
        ctx.moveTo points[0]...

        #Last index to draw is the last index of the array...
        lastIndex = points.length - 1

        #...unless the clip is periodic, in which case we connect back to the start
        lastIndex++ if smoothConfig.clip is 'periodic'

        #Add all of the curve segments
        addCurveSegment cx, i, points for i in [0...lastIndex]

        #Set drawing style
        cx.lineWidth = 2
        cx.strokeStyle = '#0000ff'
        cx.lineJoin = 'round'
        cx.lineCap = 'round'

        #Draw the path
        cx.stroke()



    #initial point
    # x = points[0][0]
    # y = points[0][1]
    # for point in points
    #   this.drawDot(ctx,point)
    #   for i in [0...point[2]*20]
    #     delta = Math.random()
    #     delta -= Math.random()
    #     this.drawDot(ctx,[point[0]+delta,point[1]+delta,point[2]])
    
    # if points.length == 1     
    #   ctx.beginPath()
    #   ctx.arc(x, y, size/2, 0, Math.PI * 2, true);
    #   ctx.fillStyle=color
    #   ctx.fill()
    # else if points.length < 6
    #   ctx.lineWidth = size
    #   ctx.strokeStyle = color
    #   ctx.beginPath()
    #   ctx.moveTo(x,y)
    #   for point in points[1..]
    #     x = point[0]
    #     y = point[1]
    #     ctx.lineTo(x,y)
    #   ctx.stroke()
    # else
    #   ctx.lineWidth = size
    #   ctx.strokeStyle = color
    #   ctx.beginPath()
    #   ctx.moveTo(x,y)
    #   index = 1
    #   for point in points[1..points.length-2]
    #     x = point[0]
    #     y = point[1]
    #     xc = (x + points[index+1][0]) / 2
    #     yc = (y + points[index+1][1]) / 2
    #     ctx.quadraticCurveTo(x,y, xc, yc)
    #     index++

    #   #curve through last two points
    #   ctx.quadraticCurveTo(points[index-1][0],points[index-1][1], points[index][0], points[index][1])
    #   ctx.stroke()
    return
  this.applyStrokes = (ctx, strokes) ->
    for stroke in strokes
      this.drawStroke(ctx, stroke)
    return
  this.playStrokes = (onion_skin, $transport, strokes, stroke_index=0, point_index=0, timer=null, callback) ->
    ctx = onion_skin.feedback_ctx
    width = onion_skin.width
    height = onion_skin.height

    window.clearInterval(timer) if timer
    # #splice into the stroke and draw the beginning strokes and points
    #deep clone an object so we don't screw up the source
    draw_to = JSON.parse(JSON.stringify(strokes))
    draw_to = draw_to[0..stroke_index]
    # the last stroke's last point should be truncated to current point index
    draw_to[draw_to.length-1][2] = draw_to[draw_to.length - 1][2][0..point_index]
    # #draw the sucker
    this.clear(ctx, width, height)
    this.applyStrokes(ctx, draw_to)

    # #is there more to draw?
    if point_index < strokes[stroke_index][2].length - 1
      next_point_index = point_index + 1
      next_stroke_index = stroke_index
      delay = strokes[next_stroke_index][2][next_point_index][2] - strokes[stroke_index][2][point_index][2]
    else if stroke_index < strokes.length - 1
      next_stroke_index = stroke_index + 1
      next_point_index = 0
      delay = 200 #time between strokes is not recorded
    else
      callback.call()
      return

    #return if interrupt 
    if $transport.hasClass('playing')
      #set a recursive with delay, pass a reference to this interval timer so it can be deleted
      new_timer = window.setInterval( =>
        this.playStrokes(onion_skin, $transport, strokes, next_stroke_index, next_point_index, new_timer, callback)
      ,delay)
      return
    else
      this.clear(ctx, width, height)
      this.applyStrokes(ctx, strokes)
      callback.call()
      return







#this class is the controller
#creates a listener, and storage facility to hold the points
#and calls Rendering

class SketchyPad

  
  

  constructor: (opts) ->
    
    #add wacom plugin to let us get pen pressure information
    @$wacom_object = $('<object>',{id:'wtPlugin',type:'application/x-wacomtabletplugin'})
    @$wacom_object.append($('<param>',{name:'onload',value:'pluginLoaded'}))
    $('body').append(@$wacom_object)

    #create a listening layer to listen for pen drawing and also redraw current stoke in realtime
    @sketch_listener = new SketchListener(opts)
    @$fg_canvas = @sketch_listener.$canvas

    #register some methods to respond to the @sketch_listener events
    @sketch_listener.addCallback('onCanvasMouseUp', @process_mouse_up)
    @sketch_listener.addCallback('onCanvasMouseMove', @process_mouse_move)
    @sketch_listener.addCallback('onCanvasMouseDown', @process_mouse_down)
    @sketch_listener.addCallback('onCanvasMouseHover', @show_tool_size)
    @sketch_listener.addCallback('onCanvasMouseOut', @refresh)

    #create a background canvas to cache the strokes in image form
    #when pen is lifted, the data from @sketchlistener's canvas will be copied here
    @$bg_canvas = $('<canvas>',opts).attr('width',opts['width']).attr('height',opts['height']);

    # @$canvas = @sketch_listener.$canvas
    # @feedback_ctx = @$canvas[0].getContext('2d')
    # @feedback_ctx.lineCap = 'round'

   

    # @width = @sketch_listener.width
    # @height = @sketch_listener.height
    
    # @feedback_canvas = @$canvas = $('<canvas>',opts).attr('width',opts['width']).attr('height',opts['height']);

    # #create undo/redo object
    # # @undo_redo = new UndoRedo(@image)
    # #bind self as a callback 
    # @strokeData = []
    # @sketchData = []
    # @redoData = [] #holding area for undos
    # @selected_tool = '#ff0000' #color for brush, null for eraser
    # @tool_size = 1

    


  getPressure: =>
    return document.getElementById('wtPlugin').penAPI.pressure


  captureStart: =>
      @sketch_listener.start()

  captureStop: =>
    @sketch_listener.stop()

  

  show_tool_size: =>
    # if @selected_tool
    #   @$canvas.addClass('brush')
    #   @$canvas.removeClass('eraser')
    # else
    #   @$canvas.addClass('eraser')
    #   @$canvas.removeClass('brush')
    
    Renderer.clear(@feedback_ctx, @width, @height)
    Renderer.applyStrokes(@feedback_ctx, @sketchData)
    # Renderer.drawStroke(@feedback_ctx, [@selected_tool, @tool_size, [[@sketch_listener.mouseCoord.x, @sketch_listener.mouseCoord.y, null]]])

    
     
  process_mouse_down: =>
    @redoData = []
    @startTime = new Date().getTime() 
    @strokeData.push([@sketch_listener.mouseCoord.x, @sketch_listener.mouseCoord.y, @getPressure(), 0])
    Renderer.clear(@feedback_ctx, @width, @height)
    Renderer.applyStrokes(@feedback_ctx, @sketchData)
    Renderer.drawStroke(@feedback_ctx, [@selected_tool, @tool_size, @strokeData])



  process_mouse_move: =>
    console.log(@getPressure())
    #for animating playback use
    @elapsed_time = (new Date().getTime()) - @startTime

    @strokeData.push([@sketch_listener.mouseCoord.x, @sketch_listener.mouseCoord.y, @getPressure(), @elapsed_time])
    Renderer.clear(@feedback_ctx, @width, @height)
    Renderer.applyStrokes(@feedback_ctx, @sketchData)
    Renderer.drawStroke(@feedback_ctx, [@selected_tool, @tool_size, @strokeData])


  process_mouse_up:  =>
    #save this brush information in the play back archive
    #tool - brush or eraser, size of the tool, raw_stroke_data
    @sketchData.push([@selected_tool, @tool_size, @strokeData])
    @strokeData = []
    Renderer.applyStrokes(@feedback_ctx, @sketchData)
    # @undo_redo.create_undo_state(['b#ff0000',3,raw_stroke_data])


  refresh: =>
    #clears canvas and redraws data
    Renderer.clear(@feedback_ctx, @width, @height)
    Renderer.applyStrokes(@feedback_ctx, @sketchData)

  reset: =>
    #resets data only
    @sketchData = []
    @strokeData = []

  

root.SketchyPad = SketchyPad


#create jQuery plugin
(($, window, document) ->
  # Prepare your internal $this reference.
  $this = undefined

  # Store your default settings in something "private".
  # The simplest way to do so is to abide by the convention that anything
  # named with a leading underscore is part of the private API (a well-known
  # interface contract in the JavaScript community).
  _settings =
    default: 'cool!'
    
  # You *may* rely on internal, private objects:
  _flag = false
  _anotherState = null
  _listening_layer = null

  # This is your public API (no leading underscore, see?)
  # All public methods must return $this so your plugin is chainable.
  methods =
    init: (options) ->
      $this = $(@)

      opts = {width:$this.width(), height:$this.height()}
      _listening_layer = new SketchyPad(opts);
      $this.prepend(_listening_layer.$canvas);
      _listening_layer.captureStart();

      # The settings object is available under its name: _settings. Let's
      # expand it with any custom options the user provided.
      $.extend _settings, (options or {})
      # Do anything that actually inits your plugin, if needed, right now!
      # An important thing to keep in mind, is that jQuery plugins should be
      # built so that one can apply them to more than one element, like so:
      #
      #  $('.matching-elements, #another-one').sketchyPad()
      #
      # It means the $this object we populated using @ (this) is to be
      # considered an array of selectors, and one must always perform
      # computations while iterating over them:
      #
      #  $this.each (index, el) ->
      #    # do something with el
      #
      return $this

    doSomething: (what) ->
      # Another public method that people can call and rely on to do "what".
      return $this

    # This method is often overlooked.
    destroy: ->
      console.log('calling destroy')
      _listening_layer.captureStop();
      _listening_layer.$canvas.remove();
      # Do anything to clean it up (nullify references, unbind events…).
      return $this

  # This is your private API. Most of your plugin code should go there.
  # The name "_internals" is by no mean mandatory: pick something you like, don't
  # forget the leading underscore so that the code is self-documented.
  # Those methods do not need to return $this. You may either have them working
  # by side-effects (modifying internal objects, see above) or, in a more
  # functionnal style, pass all required arguments and return a new object.
  # You can access the …settings, or other private methods using …internals.method,
  # as expected.
  _internals =
    # this toggles our "global" yet internal flag:
    toggleFlag: ->
      _flag = !_flag

    # This one does not alter anything: it requires parameters (to be documented)
    # and then it returns something based on those params. Use case (for instance):
    #
    #  state = _internals.computeSomething(_anotherState || false, _flag)
    #
    computeSomething: (state, flag) ->
      flag ? state : "No, that's not right."

  # Here is another important part of a proper plugin implementation: the clean
  # namespacing preventing from cluttering the $.fn namespace. This explains why
  # we went the extra miles of providing a pair of public and private APIs.
  # This is also the place where you specify the name of your plugin in your code.
  $.fn.sketchyPad = (method) ->
    console.log(method)
    if methods[method]
      methods[method].apply this, Array::slice.call(arguments, 1)
    else if typeof method is "object" or not method
      methods.init.apply this, arguments
    else
      $.error "Method " + method + " does not exist on jquery.sketchyPad"
) jQuery, window, document