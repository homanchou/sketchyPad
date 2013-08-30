root = exports ? this




#############################################################################  

############################################################################# 
#
# Creates canvas and binds event listeners, register callbacks to do something
# when mouse/pen is up, down or moving
# use start and stop to pause listening

class SketchListener
  constructor: (opts) ->
    @$canvas = $('<canvas>',opts);
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


root.SketchListener = SketchListener




# #this class is responsible for actually drawing lines

# class Renderer
#   this.apply = (layer, instruction) ->
#     context = layer[0].getContext('2d')
#   this.clear = (ctx, width, height) ->
#     ctx.clearRect( 0 , 0 , width, height)

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

#     #initial point
#     x = points[0][0]
#     y = points[0][1]
#     if points.length == 1     
#       ctx.beginPath()
#       ctx.arc(x, y, size/2, 0, Math.PI * 2, true);
#       ctx.fillStyle=color
#       ctx.fill()
#     else if points.length < 6
#       ctx.lineWidth = size
#       ctx.strokeStyle = color
#       ctx.beginPath()
#       ctx.moveTo(x,y)
#       for point in points[1..]
#         x = point[0]
#         y = point[1]
#         ctx.lineTo(x,y)
#       ctx.stroke()
#     else
#       ctx.lineWidth = size
#       ctx.strokeStyle = color
#       ctx.beginPath()
#       ctx.moveTo(x,y)
#       index = 1
#       for point in points[1..points.length-2]
#         x = point[0]
#         y = point[1]
#         xc = (x + points[index+1][0]) / 2
#         yc = (y + points[index+1][1]) / 2
#         ctx.quadraticCurveTo(x,y, xc, yc)
#         index++

#       #curve through last two points
#       ctx.quadraticCurveTo(points[index-1][0],points[index-1][1], points[index][0], points[index][1])
#       ctx.stroke()
#     return
#   this.applyStrokes = (ctx, strokes) ->
#     for stroke in strokes
#       this.drawStroke(ctx, stroke)
#     return
#   this.playStrokes = (onion_skin, $transport, strokes, stroke_index=0, point_index=0, timer=null, callback) ->
#     ctx = onion_skin.feedback_ctx
#     width = onion_skin.width
#     height = onion_skin.height

#     window.clearInterval(timer) if timer
#     # #splice into the stroke and draw the beginning strokes and points
#     #deep clone an object so we don't screw up the source
#     draw_to = JSON.parse(JSON.stringify(strokes))
#     draw_to = draw_to[0..stroke_index]
#     # the last stroke's last point should be truncated to current point index
#     draw_to[draw_to.length-1][2] = draw_to[draw_to.length - 1][2][0..point_index]
#     # #draw the sucker
#     this.clear(ctx, width, height)
#     this.applyStrokes(ctx, draw_to)

#     # #is there more to draw?
#     if point_index < strokes[stroke_index][2].length - 1
#       next_point_index = point_index + 1
#       next_stroke_index = stroke_index
#       delay = strokes[next_stroke_index][2][next_point_index][2] - strokes[stroke_index][2][point_index][2]
#     else if stroke_index < strokes.length - 1
#       next_stroke_index = stroke_index + 1
#       next_point_index = 0
#       delay = 200 #time between strokes is not recorded
#     else
#       callback.call()
#       return

#     #return if interrupt 
#     if $transport.hasClass('playing')
#       #set a recursive with delay, pass a reference to this interval timer so it can be deleted
#       new_timer = window.setInterval( =>
#         this.playStrokes(onion_skin, $transport, strokes, next_stroke_index, next_point_index, new_timer, callback)
#       ,delay)
#       return
#     else
#       this.clear(ctx, width, height)
#       this.applyStrokes(ctx, strokes)
#       callback.call()
#       return





# #this class creates an onion skin over a post image

# class OnionSkin

#   this.inc_comments_counter = (post_id, $trigger_container) ->
#     old_count = parseInt($trigger_container.attr('data-comments-count'))
#     new_count = old_count + 1
#     $trigger_container.attr('data-comments-count', new_count)
#     $('.comments_link_'+post_id).each (index, element) -> 
#       new_link_text = $(element).text().replace(/\(.\)/,"(#{new_count})")
#       $(element).text(new_link_text)

#   this.dec_comments_counter = (post_id, $trigger_container) ->
#     old_count = parseInt($trigger_container.attr('data-comments-count'))
#     new_count = old_count - 1
#     $trigger_container.attr('data-comments-count', new_count)
#     $('.comments_link_'+post_id).each (index, element) -> 
#       new_link_text = $(element).text().replace(/\(.\)/,"(#{new_count})")
#       $(element).text(new_link_text)

#   this.prepareFor = ($image, post_id, commenter_nickname, $trigger_container) ->
#     onion_skin = new OnionSkin($image, post_id, commenter_nickname)
#     #create a link to show comments
#     $toggleOn = $('<a>',{text:"Comments (#{$trigger_container.attr('data-comments-count')}) ►", href:'#comments', class:"comments_toggle_on comments_link_#{post_id}"}).appendTo($trigger_container)
#     $toggleOff = $('<a>',{text:"Comments (#{$trigger_container.attr('data-comments-count')}) ▼", href:'#comments', class:"comments_toggle_off comments_link_#{post_id}", style:'display:none;'}).appendTo($trigger_container)

#     $toggleOn.bind 'click': (evt) ->
#       evt.preventDefault()
#       $toggleOn.hide()
#       $toggleOff.show()
#       $('.comments_container_'+post_id).slideDown('fast','swing')
#       onion_skin.slideDown()
#       onion_skin.captureStart()

#     $toggleOff.bind 'click': (evt) ->
#       evt.preventDefault()
#       $('.comments_container_'+post_id).slideUp('fast','swing', ->
#         $toggleOff.hide()
#         $toggleOn.show()
#       )
#       onion_skin.captureStop()
#       onion_skin.slideUp()


#     #bind animation behavior when you click on a comments play button
#     $(".comments_container_#{post_id} .comment_transport").live 'click': (evt) ->
#       $transport = $(evt.target)
#       comment = $transport.parents('li')
#       comment.effect("highlight", {}, 500)
#       if ($transport.hasClass('playing'))
#        #set interrupt flag, causes animation to skip to end and trigger callback
#         $transport.removeClass('playing')
#       else
#         #first stop all other comments which might be playing back
#         $('.comment_transport.playing').removeClass('playing')
#         $transport.addClass('playing')
#         onion_skin.captureStop()
#         data = JSON.parse(comment.attr('data-sketch-data'))
#         Renderer.playStrokes(onion_skin, $transport, data, 0, 0, null, =>
#           $transport.removeClass('playing')
#           onion_skin.captureStart()
#         )


#     #bind the submit button to check that 
#     #a text comment is written
#     #on success, clear the textarea and prepend new comment to top of list
    
#     $('.comment_submit_'+post_id).bind 'click': (e) ->
#       comment_desc = $('.comment_desc_'+post_id).val()
#       if comment_desc == "" && onion_skin.sketchData.length < 1
#         alert('Please type a comment and/or draw a visual comment')
#         return false
#       $('#loading').show()
#       comment_desc = "[Click to see visual comment]" if comment_desc == ""
#       jqxhr = $.post '/comments', {
#         'comment[post_id]':post_id,
#         'comment[description]':comment_desc,
#         'comment[sketch_data]':JSON.stringify(onion_skin.sketchData)
#         }
#       jqxhr.success (data) ->
#         $('#loading').hide()
#         $('.comment_desc_'+post_id).val('')
#         #prepend new comment into the list
#         new_comment = $('<li>',{class:"post_comment post_comment_#{post_id}", 'data-sketch-data':JSON.stringify(onion_skin.sketchData)})
#         new_comment.append($('<div>',{class:'comment_transport'})) if onion_skin.sketchData.length > 0
#         new_comment.append($('<div>').append($('<span>',{class:'artist_nickname', text:commenter_nickname})).append($('<span>',{class:'comment_date',text:'Just now'})).
#           append("\n").
#           append($('<a>',{href:'/comments/'+data.comment_id,text:'✖',class:'delete_comment_for_post_'+post_id,'data-confirm':'Delete forever, Sure?','data-method':'delete','data-remote':'true',rel:'nofollow'})))
#         new_comment.append($('<p>',{class:'post_comment_description',text:comment_desc}))
#         $('.post_comments_'+post_id).css('border','1px solid #ccc')
#         $('.post_comments_'+post_id).prepend(new_comment)
#         #increment the comments counter
#         OnionSkin.inc_comments_counter(post_id, $trigger_container)
#         onion_skin.reset()
#         onion_skin.refresh()
#       jqxhr.error (xhr) ->
#         alert('Error.  Are you logged in?')
#       return $(e.target)


#     #bind delete link
#     $('.delete_comment_for_post_'+post_id).live "ajax:success": (evt, data, status, xhr) ->
#       delete_link = $(evt.target)
#       delete_link.parents('li').remove()
#       OnionSkin.dec_comments_counter(post_id, $trigger_container)
#     $('.delete_comment_for_post_'+post_id).live "ajax:error": (evt, xhr, status, error) ->
#       if xhr.status == "401"
#         alert 'Login first'
#       else
#         alert xhr.responseText
    





#     return onion_skin
#       #can't seem to place tag or html entity codes in hash otherwise it becomes literal
#     #  $trigger.text("Comments (#{$trigger_container.attr('data-comments-count')}) ▼")
#     #  $trigger.unbind 'click'
      



#   #pass in jQuery object of the image we want to onion skin
#   constructor: (@$image, @post_id, @commenter_nickname) ->
#     @$tools = @create_tools()
    
#     #main canvas for listening to mouse movements, since this canvas must remain on top, with high z-index
#     #it doubles as a feedback for hover and line smoothing animation
#     @sketch_listener = new SketchListener(@$image, @post_id)
#     @$canvas = @sketch_listener.$canvas
#     #create a label tag on top of canvas
#     @$label = $('<div>',{text:'onion skin (beta)',class:'onion_skin_label', style:'display:none;'})
#     @$label.appendTo(@$image.parent())
#     @feedback_ctx = @$canvas[0].getContext('2d')
#     @feedback_ctx.lineCap = 'round'

#     @sketch_listener.addCallback('onCanvasMouseHover', @show_tool_size)
#     @sketch_listener.addCallback('onCanvasMouseOut', @refresh)

#     @width = @sketch_listener.width
#     @height = @sketch_listener.height
#     #create undo/redo object
#     # @undo_redo = new UndoRedo(@image)
#     #bind self as a callback 
#     @strokeData = []
#     @sketchData = []
#     @redoData = [] #holding area for undos
#     @selected_tool = '#ff0000' #color for brush, null for eraser
#     @tool_size = 3

#     @sketch_listener.addCallback('onCanvasMouseUp', @process_mouse_up)
#     @sketch_listener.addCallback('onCanvasMouseMove', @process_mouse_move)
#     @sketch_listener.addCallback('onCanvasMouseDown', @process_mouse_down)


#   captureStart: =>
#       @sketch_listener.start()

#   captureStop: =>
#     @sketch_listener.stop()

#   slideDown: =>
#     @$tools.slideDown()
#     @$canvas.slideDown()
#     @$label.fadeIn()

#   slideUp: =>
#     @$tools.slideUp()
#     @$canvas.slideUp()
#     @$label.fadeOut()

#   show_tool_size: =>
#     if @selected_tool
#       @$canvas.addClass('brush')
#       @$canvas.removeClass('eraser')
#     else
#       @$canvas.addClass('eraser')
#       @$canvas.removeClass('brush')
    
#     Renderer.clear(@feedback_ctx, @width, @height)
#     Renderer.applyStrokes(@feedback_ctx, @sketchData)
#     Renderer.drawStroke(@feedback_ctx, [@selected_tool, @tool_size, [[@sketch_listener.mouseCoord.x, @sketch_listener.mouseCoord.y, null]]])

    
     
#   process_mouse_down: =>
#     @redoData = []
#     @startTime = new Date().getTime() 
#     @strokeData.push([@sketch_listener.mouseCoord.x, @sketch_listener.mouseCoord.y, 0])
#     Renderer.clear(@feedback_ctx, @width, @height)
#     Renderer.applyStrokes(@feedback_ctx, @sketchData)
#     Renderer.drawStroke(@feedback_ctx, [@selected_tool, @tool_size, @strokeData])



#   process_mouse_move: =>

#     #for animating playback use
#     @elapsed_time = (new Date().getTime()) - @startTime

#     @strokeData.push([@sketch_listener.mouseCoord.x, @sketch_listener.mouseCoord.y, @elapsed_time])
#     Renderer.clear(@feedback_ctx, @width, @height)
#     Renderer.applyStrokes(@feedback_ctx, @sketchData)
#     Renderer.drawStroke(@feedback_ctx, [@selected_tool, @tool_size, @strokeData])


#   process_mouse_up:  =>
#     #save this brush information in the play back archive
#     #tool - brush or eraser, size of the tool, raw_stroke_data
#     @sketchData.push([@selected_tool, @tool_size, @strokeData])
#     @strokeData = []
#     #Renderer.applyStrokes(@feedback_ctx, @sketchData)
#     #@undo_redo.create_undo_state(['b#ff0000',3,raw_stroke_data])




#   create_tools: ->
#     tools = $('<div>', {
#       class: "onion_skin_tools onion_skin_tool_#{@post_id}",
#       style: "display:none"
#     })
#     $('<div class="tool eraser_btn"></div>').appendTo(tools)
#     $('<div class="tool brush_btn color1"></div>').appendTo(tools)
#     $('<div class="tool brush_btn color2"></div>').appendTo(tools)
#     $('<div class="tool brush_btn color3"></div>').appendTo(tools)
#     $('<div class="tool brush_btn color4"></div>').appendTo(tools)
#     $('<div class="tool brush_btn color5"></div>').appendTo(tools)
#     $('<div class="tool size size1" data-size="2"></div>').appendTo(tools)
#     $('<div class="tool size size2" data-size="5"></div>').appendTo(tools)
#     $('<div class="tool size size3" data-size="11"></div>').appendTo(tools)
#     $('<div class="tool size size4" data-size="17"></div>').appendTo(tools)
#     $('<div class="tool undo_redo_clear undo_btn">undo</div>').appendTo(tools)
#     $('<div class="tool undo_redo_clear redo_btn">redo</div>').appendTo(tools)
#     $('<div class="tool undo_redo_clear clear_btn">clear</div>').appendTo(tools)


#     tools.appendTo(@$image.parent())


#     #appending tool changes


#     #show 3 brush sizes
#     for num in [1..4]
#       $target = $(".onion_skin_tool_#{@post_id} .size#{num}")
#       brush_width = $target.attr('data-size')
#       #create canvases to draw circles, use existing canvas maker
#       $canvas = CanvasMaker.make($target, $target, {class:'brush_size', 'data-size':brush_width})
#       ctx = $canvas[0].getContext('2d')
#       #use existing render function to draw a dot
#       Renderer.drawStroke(ctx, ['black', brush_width, [[15, 15, null]] ])

#     $(".onion_skin_tool_#{@post_id} .brush_size").bind 'click', (event, data) => 
#       @tool_size = $(event.target).attr('data-size')

#     $(".onion_skin_tool_#{@post_id} .brush_btn").bind 'click', (event, data) => 
#       @selected_tool = $(event.target).css('background-color')

#     $(".onion_skin_tool_#{@post_id} .eraser_btn").bind 'click', (evt, data) => 
#       @selected_tool = null

#     $(".onion_skin_tool_#{@post_id} .undo_btn").bind 'click', (evt, data) =>
#       if @sketchData.length > 0
#         @redoData.push(@sketchData.pop())
#         @refresh()

#     $(".onion_skin_tool_#{@post_id} .redo_btn").bind 'click', (evt, data) =>
#       if @redoData.length > 0
#         @sketchData.push(@redoData.pop())
#         @refresh()

#     $(".onion_skin_tool_#{@post_id} .clear_btn").bind 'click', (evt, data) =>
#       @reset() #remove data
#       @refresh() #clear canvas


#     return tools


#   refresh: =>
#     #clears canvas and redraws data
#     Renderer.clear(@feedback_ctx, @width, @height)
#     Renderer.applyStrokes(@feedback_ctx, @sketchData)

#   reset: =>
#     #resets data only
#     @sketchData = []
#     @strokeData = []

  



# #bind the class to the window object so we can access it from links etc


# window.OnionSkin = OnionSkin
