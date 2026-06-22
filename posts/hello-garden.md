---
title: hello, garden
date: 2026-06-22
image: /images/lyrical_neutral.png
description: a quick test post while I figure out how this whole thing works.
---

This is my first post on the new site. Just testing things out.

**bold text** and *italic text* both work, along with:

	class_name component_audio
	extends AudioStreamPlayer

	## If we're only asking AudioManager to play something, not making our own players
	@export var remote_mode : bool = false
	@export var my_audio_manager : audio_manager
	@export var my_audio : AudioStream
	@export var skip_in_load : bool = true

	func play_my_audio() -> void:
		play_audio_stream(my_audio,bus)

	func play_audio(audio_id : String, bus_id : String) -> void:
		if !SceneManager.is_busy_late() or !skip_in_load:
			my_audio_manager.play_audio(audio_id,bus_id)

	func play_audio_resource(audio_stream : AudioStream, bus_id : String = "Sfx") -> void:
		if !SceneManager.is_busy_late() or !skip_in_load:
			if bus_id == "Music":
				AudioManager.play_audio_crossfade(AudioManager.get_audio_resource_id(audio_stream),bus_id)
			else:
				my_audio_manager.play_audio_resource(audio_stream,bus_id)

	func play_audio_stream(audio_stream : AudioStream, bus_id : String = "Sfx") -> void:
		play_audio_resource(audio_stream,bus_id)

	func play_loop_audio_stream(audio_stream : AudioStream, bus_id : String = "Sfx") -> void:
		my_audio_manager.play_loop_audio_stream(audio_stream,bus_id)

	func stop_loop_audio_stream() -> void:
		my_audio_manager.stop_loop_audio_stream()

	func mute(enabled : bool) -> void:
		my_audio_manager.mute(enabled)

Here's a quote:
>	"Pull the lever, Kronk!"
>	
>	— Yzma


And here's how an image would go (once the file actually exists):

![a screenshot](/images/Lullabloom Heart.png)
