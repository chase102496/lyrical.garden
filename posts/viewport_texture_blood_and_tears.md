---
title: Some fun shader insights. Also, pain.
date: 2026-06-26
image: /images/cinematic_shot_1.jpg
description: Pain and fun. What better combo is there?
---

<video width="100%" controls>
    <source src="https://i.imgur.com/11l1ws7.mp4" type="video/mp4">
</video>



*Here's a pleasant clip of something from my game, [Stories of Somnia](https://store.steampowered.com/app/3635640/Stories_of_Somnia/) before things get unpleasant.*

---

I just spent three hours fighting `ViewportTexture` in Godot and I need to talk about it before the rage leaves my body and I lose the lesson along with it.

Here's the setup: I have a custom sprite node that needs to show a live `SubViewport` render on a mesh's albedo. Simple. Standard. People do this constantly. So naturally Godot's `ViewportTexture` decided this was the hill to make me die on.

The problem was this texture is repeated across a ton of different enemies, npcs, etc. so it needs to be unique for each one. This bugged me because that meant if I wanted to change one material I had to go back and change the other ones one-by-one.

Godot naturally does not do well with insanely specific hack-y builds, so it started throwing errors any time I instantiated a scene with this custom sprite. I used to live with it, but today I decided I've had enough of its shit.

Here's how it looks in [Godot](https://godotengine.org/)

<img title="" src="https://i.imgur.com/ZeEzl7H.png" alt="alt text" data-align="center" width="594">

Really simple, but you'd be surprised how complicated the front end gets.



<img src="https://i.imgur.com/B2f0nNg.png" title="" alt="" width="276"><img title="" src="https://i.imgur.com/x0O77LM.png" alt="" width="365" data-align="inline">



<img title="" src="https://i.imgur.com/Ti07aDV.png" alt="" width="356" data-align="center">

*This shader adds a recolor + outline + glowing noise texture on top of this guy, who is usually this color without all the fancy stuff:*

<img src="https://i.imgur.com/nB2BbwV.png" title="" alt="" data-align="center">

Yes, yes I am pretentious enough to call my node *Better*Sprite3D. Because, well, frankly... It is. At least for my 2.5D game where I need fancy recolors, scrolling textures and other stuff:

<img title="" src="https://i.imgur.com/wpCVL0p.png" alt="" width="231" data-align="inline"><img title="" src="https://i.imgur.com/7EMDabL.png" alt="" width="303">

<img src="https://i.imgur.com/Pt8Elfg.png" title="" alt="" width="280"><img src="https://i.imgur.com/RYHz31C.png" title="" alt="" width="230">

This is all done with base textures that I never touch or re-animate or *anything.* All of this is done live, which means I can recolor sprites on-the-fly too! Super versatile, and mostly the result of my lazy butt not wanting to commit to one color of the bush of a dude who players will see for 5 seconds approximately.

---

ANYWHO, back to the point: insanity because I don't like seeing errors in the console when I'm trying to actually check for *real errors* not *drama queens*.

I spent about 4 hours trying to fix texture issues. The problem is that Godot's materials are built for reusability, so when you try to make them unique per-mesh things get complicated really quick. Here's the code for the BetterAnimatedSprite3D:

```gdscript
@icon("res://Resources/Textures/2D/UI/node icons/node_3D/icon_hitbox.png")
@tool
class_name BetterAnimatedSprite3D
extends BetterSprite

@export_group("Pointers")
@export var my_animated_sprite_2d : AnimatedSprite2D
@export var my_viewport : SubViewport
@export var my_mesh : MeshInstance3D

@export_category("Features")
@export var material_override_3d : StandardMaterial3D:
    set(value):
        material_override_3d = value
@export var material_overlay_3d : Material:
    set(value):
        material_overlay_3d = value
        my_mesh.material_overlay = value
@export var material_override_2d : Material:
    set(value):
        if !Engine.is_editor_hint():
            material_override_2d = value.duplicate()
        else:
            material_override_2d = value

        my_animated_sprite_2d.material = material_override_2d
@export var transparency_type : BaseMaterial3D.Transparency = BaseMaterial3D.TRANSPARENCY_ALPHA_SCISSOR:
    set(value):
        transparency_type = value
        var mat : StandardMaterial3D = _material() as StandardMaterial3D
        if !mat:
            return
        mat.transparency = value
@export var distance_fade_mode : BaseMaterial3D.DistanceFadeMode = BaseMaterial3D.DistanceFadeMode.DISTANCE_FADE_DISABLED:
    set(value):
        var mat : Material = _material()
        if mat:
            distance_fade_mode = value
            mat.distance_fade_mode = value
@export_range(0.0,50.0,0.1) var distance_fade_min : float = 2.0:
    set(value):
        if distance_fade_mode == BaseMaterial3D.DistanceFadeMode.DISTANCE_FADE_DISABLED:
            return
        var mat : Material = _material()
        if mat:
            distance_fade_min = value
            mat.distance_fade_min_distance = value
@export_range(0.0,50.0,0.1) var distance_fade_max : float = 3.5:
    set(value):
        if distance_fade_mode == BaseMaterial3D.DistanceFadeMode.DISTANCE_FADE_DISABLED:
            return
        var mat : Material = _material()
        if mat:
            distance_fade_max = value
            mat.distance_fade_max_distance = value

@export_category("Emission")
@export var emission_color : Color = Color.WHITE:
    set(value):

        if value == Color.BLACK:
            return

        emission_color = value

        if emission == 0.0:
            pass

        if my_animated_sprite_2d:
            if emission != 0.0:
                my_animated_sprite_2d.modulate = value
            else:
                my_animated_sprite_2d.modulate = Color.WHITE

        var mat : Material = _material()

        if mat and mat is StandardMaterial3D:
            mat.emission = value
        else:
            push_error("No material found for set_emission_color!")
@export_range(0.0,100.0,0.1) var emission : float = 0.0:
    set(value):

        emission = value

        var mat : Material = _material()

        if mat and mat is StandardMaterial3D:
            mat.emission_energy_multiplier = value
            mat.emission_enabled = (emission != 0.0)
            emission_color = emission_color #Update to stored info
        else:
            push_error("No material found for set_emission!")

@export_category("AnimatedSprite3D")
@export var sprite_frames : SpriteFrames = null:
    set(value):
        sprite_frames = value
        if !sprite_frames:
            animation = ""
            frame = 0
        _update(my_animated_sprite_2d,"sprite_frames")
@export var animation: StringName:
    set(value):

        if sprite_frames:
            animation = value
            if sprite_frames.has_animation(value) and my_animated_sprite_2d.sprite_frames.has_animation(value):
                _update(my_animated_sprite_2d, "animation")
        else:
            animation = ""
@export var play_animation : bool = false:
    set(value):
        play_animation = value
        if value:
            my_animated_sprite_2d.play(animation,speed_scale)
        else:
            my_animated_sprite_2d.stop()
@export var frame : int = 0:
    set(value):
        frame = value
        my_animated_sprite_2d.set_frame(value)
        #if sprite_frames and animation:
            #_update(my_animated_sprite_2d,"frame")
            #frame = clamp(value,0,sprite_frames.get_frame_count(animation) - 1)
        #else:
            #frame = 0
@export var speed_scale : float = 1.0:
    set(value):
        speed_scale = value
        _update(my_animated_sprite_2d,"speed_scale")

@export_group("SpriteBase3D")
@export var offset : Vector2 = Vector2.ZERO:
    set(value):
        offset = value
        if my_mesh and my_viewport:
            my_mesh.position.x = offset.x * 0.01 # Pixel conversion
            my_mesh.position.y = offset.y * 0.01 # Pixel conversion
        _update()
@export var flip_h : bool = false:
    set(value):
        flip_h = value
        _update(my_animated_sprite_2d,"flip_h")
@export var flip_v : bool = false:
    set(value):
        flip_v = value
        _update(my_animated_sprite_2d,"flip_v")
@export_range(0.0,1.0,0.01) var transparency : float = 0.0:
    set(value):
        transparency = value
        my_mesh.transparency = value
        _update()
@export var no_depth_test : bool = false:
    set(value):
        no_depth_test = value
        if my_mesh:
            _material().no_depth_test = value
@export var sorting_offset : int = 0:
    set(value):
        sorting_offset = value
        my_mesh.sorting_offset = value
        _update()
@export var stencil_mode : BaseMaterial3D.StencilMode = BaseMaterial3D.StencilMode.STENCIL_MODE_DISABLED:
    set(value):
        stencil_mode = value
        if my_mesh:
            _material().stencil_mode = value
@export var stencil_color : Color = Color.WHITE:
    set(value):
        if stencil_mode in [BaseMaterial3D.StencilMode.STENCIL_MODE_OUTLINE,BaseMaterial3D.StencilMode.STENCIL_MODE_XRAY]:
            stencil_color = value
            if my_mesh:
                _material().stencil_color = value

var emission_tween : Tween
enum emission_type {
    PULSE_IN,
    PULSE_OUT
}
...
```

Anyways I spent 4 hours screaming into the void all to find out I didn't need a special solution and Godot had a built-in one:

```gdscript
Viewport.get_texture()
```

Let this be your reminder if you ever need ViewportTextures created on-the-fly. Cause I really reinvented the wheel. Like 14 times. And thought I was smart.

That's it. That's the whole fix. The `SubViewport` already has a method that just hands you its own texture directly. No path. No string to resolve. No editor-versus-runtime divergence because there's no resolution step to diverge. The viewport already knows what its own texture is. It has known the entire time. I just never asked it directly — I went through `viewport_path` because that's the property everyone shows you first, and then spent three hours debugging the indirection instead of skipping it.

`NodePath` exists for when you don't have a live reference to the node and need to find it later from a string. I had a live reference to the viewport node sitting in an `@export var` the entire time. I built a bridge to cross a river I was already standing on the other side of.

Gamedev is the path to insanity and I walked every step of it on purpose, for a one-liner.

Commit title: *Cleaned up all the errors. What did it cost me? Blood. Blood and tears.*
