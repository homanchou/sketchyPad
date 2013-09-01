root = exports ? this



#############################################################################
#Model for storing a single pen stroke
#a pen stroke is an array of points, pressures, timestamps and a color value
class SketchStroke
  constructor: () ->
    @color = 'rgba(255,0,0,0.2)'
    @points = []
    @pressures = []
    @timestamps = []

  add: (x,y,pressure) ->
    @points.push [x,y]
    @pressures.push pressure
    @timestamps.push new Date().getTime()


smoothConfig = 
  method: 'cubic'
  #method: 'lanczos'
  clip: 'clamp'
  lanczosFilterSize:  0
  cubicTension: 0

#Euclidean distance
distance = (a,b) -> Math.sqrt Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2)
slope = (p1, p2) -> (p2[1] - p1[1])/(p2[0] - p1[0])


#Add a curve segment to `context` according to current settings
# points: the entire array of points
addCurveSegment = (context, i, points, s) ->

  #average step distance
  averageLineLength = 1 

  #Incrementing the index by a constant amount does not result in a constant distance advancement
  #To ameliorate this, we divide the segment into a few pieces and compute a different increment for
  #each piece to approximate the advancement distance we want.

  pieceCount = 2 #should be a power of two so the for loop comes out exact
  for t in [0...1] by 1/pieceCount
    [start, end] = [s(i + t), s(i + t + 1/pieceCount)]
    pieceLength = distance start, end
    #compute du so that we get the desired average line length
    du = averageLineLength/pieceLength
    for u in [0...1/pieceCount] by du
      context.lineTo s(i + t + u)...
  #ensure that the path actually passes through the end points
  context.lineTo s(i+1)...

#given a set of points alter the x and y slightly depending on the pressure
distortPoints = (points, pressures, direction=1) ->
  new_points = []
  for i in [1..pressures.length-2]
    #y = mx + b, this is m
    distortion = Math.pow(pressures[i],2) * 5
    perp_angle = Math.atan2(points[i-1][1] - points[i][1], points[i-1][0] - points[i][0]) + 1.57079633
    x_distort = distortion * Math.cos(perp_angle)
    y_distort = distortion * Math.sin(perp_angle)
    new_points.push [points[i][0]+direction*x_distort, points[i][1]+direction*y_distort]
  #first and last points are the same
  new_points.push points[points.length - 1]
  new_points.unshift points[0]
  return new_points




#############################################################################
#View class responsible for rendering lines
#encapsulates an HTML5 canvas
#given a set of data, draws the points as lines on the canvas
class SketchView
  constructor: (opts) ->
    @$canvas = $('<canvas>',opts).attr('width',opts['width']).attr('height',opts['height'])
    @$canvas.css('position','absolute').css('cursor','crosshair')
    @width = @$canvas.width()
    @height = @$canvas.height()
    @ctx = @$canvas[0].getContext('2d')
    @ctx.globalCompositeOperation = "source-over"
  drawStroke: (stroke) -> 
    color = stroke.color
    points = stroke.points
    pressures = stroke.pressures
    if points.length > 2 #Draw curve if there are at least two points
      #Clear path and move to the start point
      @ctx.strokeStyle = "rgba(255,0,0,0.7)"
      @ctx.fillStyle = "rgba(255,0,0,0.7)"
      @ctx.lineWidth = 1
      @ctx.lineJoin = 'round'
      @ctx.lineCap = 'round'
      @ctx.beginPath()
      @ctx.moveTo points[0]...

      #Last index to draw is the last index of the array...
      lastIndex = points.length - 1

      #Create the smooth function
      new_points_one = distortPoints(points, pressures, 1)
      s = Smooth new_points_one, smoothConfig

      #Add all of the curve segments
      for i in [0...lastIndex]
        addCurveSegment @ctx, i, new_points_one, s 

      new_points_two = distortPoints(points, pressures, -1).reverse()
      s = Smooth new_points_two, smoothConfig
      #for i in [0...lastIndex]
      for i in [0...lastIndex]
        addCurveSegment @ctx, i, new_points_two, s

      @ctx.lineTo points[0]... 
      grd = @ctx.createLinearGradient(0, 0, @width, @height);
      grd.addColorStop(0, 'rgba(255,0,0,0.1)');   
      grd.addColorStop(1, '#004CB3');
      @ctx.fillStyle = grd
      @ctx.fill()
     

  drawStrokes: (strokes) ->
    for stroke in strokes
      @drawStroke(stroke)
  playbackStrokes: (strokes) ->
  clear: ()->
    @ctx.clearRect(0, 0, @width, @height)




##################################################################################### 
# Event router utility class that binds drawing specific event listeners to a given jQuery HTML element
# provides pen coordinates, pen pressure
# provides methods to start and stop listening
# and callbacks to delegate handling

class SketchListener
  constructor: (element) ->
    #add wacom plugin so we can get pen pressure
    @$wacom_object = $('<object>',{id:'wtPlugin',type:'application/x-wacomtabletplugin'})
    @$wacom_object.append($('<param>',{name:'onload',value:'pluginLoaded'}))
    $('body').append(@$wacom_object).
      css('-webkit-touch-callout','none').
      css('-webkit-user-select','none').
      css('-khtml-user-select','none').
      css('-moz-user-select','none').
      css('-ms-user-select','none').
      css('user-select','none')

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
    @mouseCoord[0] = Math.round(target.pageX - offset.left)
    @mouseCoord[1] = Math.round(target.pageY - offset.top)
  onCanvasMouseMove: (event) =>
    @getMouseCoord( event )
    for callback in @callbacks['onCanvasMouseMove']
      callback.call()

    event.preventDefault();
    return false;

  onCanvasMouseUp: (event) => 
    for callback in @callbacks['onCanvasMouseUp']
      callback.call()
    #switch out draw listening for hover listening
    $(document).unbind( @mouseMoveEvent, @onCanvasMouseMove )
    $(document).unbind( @mouseUpEvent, @onCanvasMouseUp )
    @$element.bind(@mouseMoveEvent, @onCanvasMouseHover) unless @touchSupported

  getPressure: =>
    pressure = document.getElementById('wtPlugin').penAPI.pressure
    pressure = 0.5 if (pressure == 0)
    return pressure







# #this class is responsible for actually drawing lines
# TODO - refactor this
# class Renderer
  
#   this.clear = (ctx, width, height) ->
#     ctx.clearRect( 0 , 0 , width, height)
#   this.drawDot = (ctx, point) ->
#     x = point[0]
#     y = point[1]
#     pressure = point[2]
#     ctx.globalCompositeOperation = "source-over"
#     ctx.beginPath()
#     ctx.arc(x, y, 1, 0, Math.PI * 2, true);
#     ctx.fillStyle='rgba(255,0,0,0.5)'
#     ctx.fill()
#   this.drawStroke = (ctx, stroke) ->
#     #size and color don't change
#     color = stroke[0]
#     size = stroke[1]
#     points = stroke[2]
#     if color == null
#       ctx.globalCompositeOperation = "destination-out" 
#       color = 'rgba(255,255,255,1)'
#     else
#       ctx.globalCompositeOperation = "source-over"

#     if points.length >= 2 #Draw curve if there are at least two points
#         #Clear path and move to the start point
#         ctx.beginPath()
#         ctx.moveTo points[0]...

#         #Last index to draw is the last index of the array...
#         lastIndex = points.length - 1

#         #...unless the clip is periodic, in which case we connect back to the start
#         lastIndex++ if smoothConfig.clip is 'periodic'

#         #Add all of the curve segments
#         addCurveSegment @ctx, i, points for i in [0...lastIndex]

#         #Set drawing style
#         @ctx.lineWidth = 2
#         @ctx.strokeStyle = '#0000ff'
#         @ctx.lineJoin = 'round'
#         @ctx.lineCap = 'round'

#         #Draw the path
#         @ctx.stroke()



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
  #   return
  # this.applyStrokes = (ctx, strokes) ->
  #   for stroke in strokes
  #     this.drawStroke(ctx, stroke)
  #   return
  # this.playStrokes = (onion_skin, $transport, strokes, stroke_index=0, point_index=0, timer=null, callback) ->
  #   ctx = onion_skin.feedback_ctx
  #   width = onion_skin.width
  #   height = onion_skin.height

  #   window.clearInterval(timer) if timer
  #   # #splice into the stroke and draw the beginning strokes and points
  #   #deep clone an object so we don't screw up the source
  #   draw_to = JSON.parse(JSON.stringify(strokes))
  #   draw_to = draw_to[0..stroke_index]
  #   # the last stroke's last point should be truncated to current point index
  #   draw_to[draw_to.length-1][2] = draw_to[draw_to.length - 1][2][0..point_index]
  #   # #draw the sucker
  #   this.clear(ctx, width, height)
  #   this.applyStrokes(ctx, draw_to)

  #   # #is there more to draw?
  #   if point_index < strokes[stroke_index][2].length - 1
  #     next_point_index = point_index + 1
  #     next_stroke_index = stroke_index
  #     delay = strokes[next_stroke_index][2][next_point_index][2] - strokes[stroke_index][2][point_index][2]
  #   else if stroke_index < strokes.length - 1
  #     next_stroke_index = stroke_index + 1
  #     next_point_index = 0
  #     delay = 200 #time between strokes is not recorded
  #   else
  #     callback.call()
  #     return

  #   #return if interrupt 
  #   if $transport.hasClass('playing')
  #     #set a recursive with delay, pass a reference to this interval timer so it can be deleted
  #     new_timer = window.setInterval( =>
  #       this.playStrokes(onion_skin, $transport, strokes, next_stroke_index, next_point_index, new_timer, callback)
  #     ,delay)
  #     return
  #   else
  #     this.clear(ctx, width, height)
  #     this.applyStrokes(ctx, strokes)
  #     callback.call()
  #     return






##################################################################################### 
# SketchController creates the sketch canvases
# it receives the messages that occur during drawing
# updates the Sketch data models
# updates the View models to render the drawing

class SketchController

  constructor: (element) ->
    #this is the element we want to create a drawable area out of
    @$element = element
    @$element.css('position','relative')
    @width = @$element.width()
    @height = @$element.height()

    #create a fg and bg canvas
    @fg_view = new SketchView({id:'sketch_pad_fg',width:@width,height:@height})
    @bg_view = new SketchView({id:'sketch_page_bg',width:@width,height:@height})
    
    #insert into the DOM at the element
    @$element.prepend(@fg_view.$canvas)
    @$element.prepend(@bg_view.$canvas)
    
    #add listening on the fg canvas
    @listener = new SketchListener(@fg_view.$canvas)

    #register some methods to respond to the events
    @listener.addCallback('onCanvasMouseUp', @process_mouse_up)
    @listener.addCallback('onCanvasMouseMove', @process_mouse_move)
    @listener.addCallback('onCanvasMouseDown', @process_mouse_down)
    # @listener.addCallback('onCanvasMouseHover', @process_mouse_hover)
    # @listener.addCallback('onCanvasMouseOut', @process_mouse_out)

    #create some data structure
    #data for the whole drawing
    @sketchData = []
    #data for just this line
    @strokeData = new SketchStroke()

    #start listening
    @listener.start()

  

     
     
  process_mouse_down: =>
    @strokeData.add(@listener.mouseCoord[0], @listener.mouseCoord[1], @listener.getPressure())
    #Renderer.clear(@feedback_ctx, @width, @height)
    #Renderer.applyStrokes(@feedback_ctx, @sketchData)
    #Renderer.drawStroke(@feedback_ctx, [@selected_tool, @tool_size, @strokeData])



  process_mouse_move: =>
    @strokeData.add(@listener.mouseCoord[0], @listener.mouseCoord[1], @listener.getPressure())
    @fg_view.clear()
    @fg_view.drawStroke(@strokeData)
    # @strokeData.push([@sketch_listener.mouseCoord.x, @sketch_listener.mouseCoord.y, @getPressure(), @elapsed_time])
    # Renderer.clear(@feedback_ctx, @width, @height)
    # Renderer.applyStrokes(@feedback_ctx, @sketchData)
    # Renderer.drawStroke(@feedback_ctx, [@selected_tool, @tool_size, @strokeData])

  process_mouse_up:  =>
    @fg_view.clear()
    @sketchData.push @strokeData
    @strokeData = new SketchStroke()
    @bg_view.clear()
    @bg_view.drawStrokes(@sketchData)
    # Renderer.applyStrokes(@feedback_ctx, @sketchData)
    # @undo_redo.create_undo_state(['b#ff0000',3,raw_stroke_data])


  # refresh: =>
  #   #clears canvas and redraws data
  #   Renderer.clear(@feedback_ctx, @width, @height)
  #   Renderer.applyStrokes(@feedback_ctx, @sketchData)

  # reset: =>
  #   #resets data only
  #   @sketchData = []
  #   @strokeData = []

  
root.SketchListener = SketchListener



############################################################################
# generic jQuery plugin wrapper
# creates the SketchController, which handles everything else
# TODO, need to clean this up
#
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
  _sketch_controller = null

  # This is your public API (no leading underscore, see?)
  # All public methods must return $this so your plugin is chainable.
  methods =
    init: (options) ->
      $this = $(@)
      
      _sketch_controller = new SketchController($this)
      # opts = {width:$this.width(), height:$this.height()}
      # _listening_layer = new SketchyPad(opts);
      # $this.prepend(_listening_layer.$canvas);
      # _listening_layer.captureStart();

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
    if methods[method]
      methods[method].apply this, Array::slice.call(arguments, 1)
    else if typeof method is "object" or not method
      methods.init.apply this, arguments
    else
      $.error "Method " + method + " does not exist on jquery.sketchyPad"
) jQuery, window, document