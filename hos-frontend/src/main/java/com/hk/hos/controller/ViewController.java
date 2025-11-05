package com.hk.hos.controller;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class ViewController {

    @GetMapping({"/", "/home", "/login", "/signup", "/map", "/board"})
    public String index() {
        return "forward:/index.html"; // 모든 경로는 index.html 반환
    }
}
