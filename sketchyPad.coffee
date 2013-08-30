root = exports ? this




#############################################################################  

############################################################################# 
#
# Creates canvas and binds event listeners, register callbacks to do something
# when mouse/pen is up, down or moving
# use start and stop to pause listening

class SketchListener
  constructor: (opts) ->
    @$canvas = $('<canvas>',opts).attr('width',opts['width']).attr('height',opts['height']);
    @width = @$canvas.width();
    @height = @$canvas.height();
    #these are events that external parties can 'listen to'
    #use addCallback, using one of these eventNames, and a function to call
    @callbacks = {onCanvasMouseHover:[], onCanvasMouseDown:[], onCanvasMouseMove:[], onCanvasMouseUp:[], onCanvasMouseOut:[]}
    @mouseCoord = {x:0, y:0};
    @touchSupported = ('ontouchstart' in window)

  start: =>
    #first close all other canvases
    if @touchSupported
      @mouseDownEvent = "touchstart"
      @mouseMoveEvent = "touchmove"
      @mouseUpEvent = "touchend"
    else
      @mouseDownEvent = "mousedown"
      @mouseMoveEvent = "mousemove"
      @mouseUpEvent = "mouseup"
      @$canvas.bind( @mouseMoveEvent, @onCanvasMouseHover )
      @$canvas.bind( 'mouseout', @onCanvasMouseOut )

    @$canvas.bind( @mouseDownEvent, @onCanvasMouseDown )
    console.log('listening started')
  stop: =>
    @$canvas.unbind()
    console.log('listening stopped')

  addCallback: (eventName, func) =>
    @callbacks[eventName].push(func)

  removeCallback: (eventName, func) =>
    indexOfCallback = @callbacks[eventName].indexOf(func)
    @callbacks[eventName].splice(indexOfCallback,1)

  onCanvasMouseHover: (event) =>
    #this is what happens when you are hovering your mouse
    @getMouseCoord(event)
    console.log('hovering')
    for callback in @callbacks['onCanvasMouseHover']
      callback.call()

  onCanvasMouseOut: (event) =>
    console.log('mouse out')
    for callback in @callbacks['onCanvasMouseOut']
      callback.call()

  onCanvasMouseDown: (event) =>
    @getMouseCoord( event )
    console.log('mouse down')

    for callback in @callbacks['onCanvasMouseDown']
      callback.call()

    #don't track hovering while drawing
    @$canvas.unbind(@mouseMoveEvent, @onCanvasMouseHover) unless @touchSupported

    $(document).bind( @mouseMoveEvent, @onCanvasMouseMove )
    $(document).bind( @mouseUpEvent, @onCanvasMouseUp )


  getMouseCoord: (event) =>
    #find the mouse coord relative to the canvas, regardless of scrolling
    if (@touchSupported)
      target = event.originalEvent.touches[0]
    else 
      target = event
    
    offset = @$canvas.offset();
    @mouseCoord.x = Math.round(target.pageX - offset.left);
    @mouseCoord.y = Math.round(target.pageY - offset.top);

  onCanvasMouseMove: (event) =>
    @getMouseCoord( event )
    console.log('mouse move')
    for callback in @callbacks['onCanvasMouseMove']
      callback.call()

    event.preventDefault();
    return false;

  onCanvasMouseUp: (event) => 
    console.log('mouse up')
    for callback in @callbacks['onCanvasMouseUp']
      callback.call()

    $(document).unbind( @mouseMoveEvent, @onCanvasMouseMove )
    $(document).unbind( @mouseUpEvent, @onCanvasMouseUp )
    #rebind hover
    @$canvas.bind(@mouseMoveEvent, @onCanvasMouseHover) unless @touchSupported






# #this class is responsible for actually drawing lines
# TODO - refactor this
class Renderer
  this.apply = (layer, instruction) ->
    context = layer[0].getContext('2d')
  this.clear = (ctx, width, height) ->
    ctx.clearRect( 0 , 0 , width, height)

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

    #initial point
    x = points[0][0]
    y = points[0][1]
    if points.length == 1     
      ctx.beginPath()
      ctx.arc(x, y, size/2, 0, Math.PI * 2, true);
      ctx.fillStyle=color
      ctx.fill()
    else if points.length < 6
      ctx.lineWidth = size
      ctx.strokeStyle = color
      ctx.beginPath()
      ctx.moveTo(x,y)
      for point in points[1..]
        x = point[0]
        y = point[1]
        ctx.lineTo(x,y)
      ctx.stroke()
    else
      ctx.lineWidth = size
      ctx.strokeStyle = color
      ctx.beginPath()
      ctx.moveTo(x,y)
      index = 1
      for point in points[1..points.length-2]
        x = point[0]
        y = point[1]
        xc = (x + points[index+1][0]) / 2
        yc = (y + points[index+1][1]) / 2
        ctx.quadraticCurveTo(x,y, xc, yc)
        index++

      #curve through last two points
      ctx.quadraticCurveTo(points[index-1][0],points[index-1][1], points[index][0], points[index][1])
      ctx.stroke()
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





#this class creates an onion skin over a post image

class SketchyPad

  
  


  #pass in jQuery object of the image we want to onion skin
  constructor: (opts) ->
    
    #main canvas for listening to mouse movements, since this canvas must remain on top, with high z-index
    #it doubles as a feedback for hover and line smoothing animation
    @sketch_listener = new SketchListener(opts)
    @$canvas = @sketch_listener.$canvas
    @feedback_ctx = @$canvas[0].getContext('2d')
    @feedback_ctx.lineCap = 'round'

    @sketch_listener.addCallback('onCanvasMouseHover', @show_tool_size)
    @sketch_listener.addCallback('onCanvasMouseOut', @refresh)

    @width = @sketch_listener.width
    @height = @sketch_listener.height
    #create undo/redo object
    # @undo_redo = new UndoRedo(@image)
    #bind self as a callback 
    @strokeData = []
    @sketchData = []
    @redoData = [] #holding area for undos
    @selected_tool = '#ff0000' #color for brush, null for eraser
    @tool_size = 1

    @sketch_listener.addCallback('onCanvasMouseUp', @process_mouse_up)
    @sketch_listener.addCallback('onCanvasMouseMove', @process_mouse_move)
    @sketch_listener.addCallback('onCanvasMouseDown', @process_mouse_down)


  captureStart: =>
      @sketch_listener.start()

  captureStop: =>
    @sketch_listener.stop()

  

  show_tool_size: =>
    if @selected_tool
      @$canvas.addClass('brush')
      @$canvas.removeClass('eraser')
    else
      @$canvas.addClass('eraser')
      @$canvas.removeClass('brush')
    
    Renderer.clear(@feedback_ctx, @width, @height)
    Renderer.applyStrokes(@feedback_ctx, @sketchData)
    Renderer.drawStroke(@feedback_ctx, [@selected_tool, @tool_size, [[@sketch_listener.mouseCoord.x, @sketch_listener.mouseCoord.y, null]]])

    
     
  process_mouse_down: =>
    @redoData = []
    @startTime = new Date().getTime() 
    @strokeData.push([@sketch_listener.mouseCoord.x, @sketch_listener.mouseCoord.y, 0])
    Renderer.clear(@feedback_ctx, @width, @height)
    Renderer.applyStrokes(@feedback_ctx, @sketchData)
    Renderer.drawStroke(@feedback_ctx, [@selected_tool, @tool_size, @strokeData])



  process_mouse_move: =>

    #for animating playback use
    @elapsed_time = (new Date().getTime()) - @startTime

    @strokeData.push([@sketch_listener.mouseCoord.x, @sketch_listener.mouseCoord.y, @elapsed_time])
    Renderer.clear(@feedback_ctx, @width, @height)
    Renderer.applyStrokes(@feedback_ctx, @sketchData)
    Renderer.drawStroke(@feedback_ctx, [@selected_tool, @tool_size, @strokeData])


  process_mouse_up:  =>
    #save this brush information in the play back archive
    #tool - brush or eraser, size of the tool, raw_stroke_data
    @sketchData.push([@selected_tool, @tool_size, @strokeData])
    @strokeData = []
    #Renderer.applyStrokes(@feedback_ctx, @sketchData)
    #@undo_redo.create_undo_state(['b#ff0000',3,raw_stroke_data])


  refresh: =>
    #clears canvas and redraws data
    Renderer.clear(@feedback_ctx, @width, @height)
    Renderer.applyStrokes(@feedback_ctx, @sketchData)

  reset: =>
    #resets data only
    @sketchData = []
    @strokeData = []

  


#root.SketchListener = SketchListener
root.SketchyPad = SketchyPad

# #bind the class to the window object so we can access it from links etc


# window.SketchyPad = SketchyPad
