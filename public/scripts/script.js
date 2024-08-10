let sidebar = document.getElementById("sidebar")
let profile = document.getElementById("profileMenu")
let menuButton = document.getElementById("menuButton")
let profileButton = document.getElementById("profileButton")
let isSidebarOpen = true
let isProfileOpen = false


menuButton.addEventListener("click", (e) => {
    if(isSidebarOpen){
        sidebar.style.left = "-250px"
        isSidebarOpen = false
    }else{
        sidebar.style.left = "0px"
        isSidebarOpen = true
    }
})
profileButton.addEventListener("click", (e) => {
    if(isProfileOpen){
        profile.style.display = "none"
        isProfileOpen = false
    }else{
        profile.style.display = "flex"
        isProfileOpen = true
    }
})