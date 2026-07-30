package com.roomiesync.controller;

import com.roomiesync.model.Notice;
import com.roomiesync.repository.NoticeRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notices")
@CrossOrigin(origins = "*")
public class NoticeController {

    @Autowired
    private NoticeRepository noticeRepository;

    @GetMapping("/all")
    public List<Notice> getAllNotices() {
        return noticeRepository.findAllByOrderByIdDesc();
    }

    @PostMapping("/add")
    public Notice addNotice(@RequestBody Notice notice) {
        return noticeRepository.save(notice);
    }

    @DeleteMapping("/delete/{id}")
    public void deleteNotice(@PathVariable Long id) {
        noticeRepository.deleteById(id);
    }
}