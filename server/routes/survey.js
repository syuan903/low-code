import express from "express";
import { surveys, getNextId } from "../db/mongo.js";

const router = express.Router();

// 获取所有问卷（按 id 升序）
router.get("/api/surveys", async (req, res) => {
  try {
    const list = await surveys()
      .find({}, { projection: { _id: 0 } })
      .sort({ id: 1 })
      .toArray();
    res.status(200).send(list);
  } catch (error) {
    res.status(500).send({ message: "获取问卷列表失败" });
  }
});

// 根据 id 获取单条问卷
router.get("/api/surveys/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const survey = await surveys().findOne({ id }, { projection: { _id: 0 } });
    if (!survey) {
      return res.status(404).send({ message: "问卷不存在" });
    }
    res.status(200).send(survey);
  } catch (error) {
    res.status(500).send({ message: "获取问卷失败" });
  }
});

// 新建问卷，body 为 SurveyDBData，返回自增数字 id
router.post("/api/surveys", async (req, res) => {
  try {
    const { createDate, updateDate, title, surveyCount, coms } = req.body;
    const id = await getNextId("survey");
    const doc = { id, createDate, updateDate, title, surveyCount, coms };
    await surveys().insertOne(doc);
    res.status(200).send({ id });
  } catch (error) {
    res.status(500).send({ message: "创建问卷失败" });
  }
});

// 更新指定问卷字段
router.put("/api/surveys/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    // 不允许通过更新修改 id 与 _id
    const { id: _ignoreId, _id, ...partialData } = req.body;
    await surveys().updateOne({ id }, { $set: partialData });
    res.status(200).send({ success: true });
  } catch (error) {
    res.status(500).send({ message: "更新问卷失败" });
  }
});

// 删除指定问卷
router.delete("/api/surveys/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    await surveys().deleteOne({ id });
    res.status(200).send({ success: true });
  } catch (error) {
    res.status(500).send({ message: "删除问卷失败" });
  }
});

export default router;
