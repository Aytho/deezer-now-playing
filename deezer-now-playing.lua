obs = obslua

local vbs_path = ""

function script_description()
    return "Start automatically Deezer Now Playing at OBS launch."
end

function script_properties()
    local props = obs.obs_properties_create()
    obs.obs_properties_add_path(
        props,
        "vbs_path",
        "Path to launch.vbs",
        obs.OBS_PATH_FILE,
        "VBS Files (*.vbs)",
        nil
    )
    return props
end

function script_defaults(settings)
    obs.obs_data_set_default_string(settings, "vbs_path", "")
end

function script_update(settings)
    vbs_path = obs.obs_data_get_string(settings, "vbs_path")
end

function script_load(settings)
    vbs_path = obs.obs_data_get_string(settings, "vbs_path")

    if vbs_path == "" then
        print("[Deezer Now Playing] No path selected.")
        return
    end

    os.execute('wscript "' .. vbs_path .. '"')
    print("[Deezer Now Playing] Server started : " .. vbs_path)
end